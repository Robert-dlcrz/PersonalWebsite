# Dynamic Trips Feature - S3 Integration

## Concept
Dynamically render all travel adventures/trips based on content uploaded to an AWS S3 bucket. This eliminates the need to redeploy the site every time a new trip is added - just upload to S3 and it appears automatically.

---

## Architecture

```
S3 Bucket (trips-bucket)
  ├── trip-1/
  │   ├── metadata.json
  │   ├── cover.jpg
  │   ├── photo1.jpg
  │   ├── photo2.jpg
  │   └── photo3.jpg
  ├── trip-2/
  │   ├── metadata.json
  │   ├── cover.jpg
  │   └── ...
  └── trip-3/
      └── ...
```

### Flow:
1. User visits `/interests` page
2. Next.js API route fetches trip list from S3
3. For each trip folder, read `metadata.json`
4. Render trips dynamically with images served from S3/CloudFront
5. Optional: Cache the trip list with ISR (Incremental Static Regeneration)

---

## Implementation Plan

### 1. S3 Bucket Structure

**Bucket Name:** `robertdelacruz-trips` (or configurable via env var)

**Each trip folder contains:**
- `metadata.json` - Trip details
- `cover.jpg` - Main thumbnail image
- `photo1.jpg, photo2.jpg, ...` - Gallery images

**Example `metadata.json`:**
```json
{
  "id": "swiss-alps-2024",
  "title": "Mountain Hiking in the Alps",
  "location": "Swiss Alps, Switzerland",
  "date": "Summer 2024",
  "displayDate": "June 15-22, 2024",
  "description": "An unforgettable journey through breathtaking mountain trails, pristine lakes, and charming alpine villages.",
  "tags": ["hiking", "mountains", "europe"],
  "coverImage": "cover.jpg",
  "gallery": ["photo1.jpg", "photo2.jpg", "photo3.jpg"],
  "featured": true,
  "order": 1
}
```

---

### 2. AWS Setup

**Required AWS Resources:**
- S3 bucket with public read access (or CloudFront distribution)
- IAM user with read-only access to the bucket
- CloudFront CDN (optional, for better performance)

**IAM Policy Example:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::robertdelacruz-trips",
        "arn:aws:s3:::robertdelacruz-trips/*"
      ]
    }
  ]
}
```

**Environment Variables:**
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
TRIPS_BUCKET_NAME=robertdelacruz-trips
CLOUDFRONT_DOMAIN=d123abc.cloudfront.net  # optional
```

---

### 3. Technical Implementation

#### Install Dependencies:
```bash
pnpm add @aws-sdk/client-s3
```

#### API Route: `/app/api/trips/route.ts`
```typescript
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.TRIPS_BUCKET_NAME!;

export async function GET() {
  try {
    // List all folders in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Delimiter: '/',
    });
    
    const listResponse = await s3Client.send(listCommand);
    const folders = listResponse.CommonPrefixes?.map(prefix => prefix.Prefix) || [];
    
    // Fetch metadata.json for each trip
    const trips = await Promise.all(
      folders.map(async (folder) => {
        try {
          const metadataKey = `${folder}metadata.json`;
          const getCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: metadataKey,
          });
          
          const response = await s3Client.send(getCommand);
          const metadataStr = await response.Body?.transformToString();
          const metadata = JSON.parse(metadataStr || '{}');
          
          // Add S3 URLs for images
          const baseUrl = process.env.CLOUDFRONT_DOMAIN 
            ? `https://${process.env.CLOUDFRONT_DOMAIN}`
            : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
          
          return {
            ...metadata,
            coverImageUrl: `${baseUrl}/${folder}${metadata.coverImage}`,
            galleryUrls: metadata.gallery?.map((img: string) => `${baseUrl}/${folder}${img}`) || [],
          };
        } catch (error) {
          console.error(`Error fetching trip ${folder}:`, error);
          return null;
        }
      })
    );
    
    // Filter out nulls and sort by order
    const validTrips = trips.filter(Boolean).sort((a, b) => (a?.order || 999) - (b?.order || 999));
    
    return NextResponse.json({ trips: validTrips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}
```

#### Updated Interests Page: `/app/interests/page.tsx`
```typescript
import Link from 'next/link';

async function getTrips() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/trips`, {
    next: { revalidate: 3600 } // Revalidate every hour (ISR)
  });
  
  if (!res.ok) {
    return { trips: [] };
  }
  
  return res.json();
}

export default async function Interests() {
  const { trips } = await getTrips();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 dark:from-slate-900 dark:via-green-950 dark:to-blue-950">
      {/* Header - same as before */}
      
      {/* Adventures Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {trips.map((trip: any) => (
          <div
            key={trip.id}
            className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform hover:scale-105 transition-all duration-300"
          >
            {/* Real Image from S3 */}
            <div className="h-48 relative overflow-hidden">
              <img 
                src={trip.coverImageUrl} 
                alt={trip.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {trip.title}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {trip.location}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {trip.displayDate || trip.date}
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {trip.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* No trips fallback */}
      {trips.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            No trips found. Upload trip folders to S3 to get started!
          </p>
        </div>
      )}
    </main>
  );
}
```

---

### 4. Deployment Checklist

- [ ] Create S3 bucket
- [ ] Upload first trip folder with metadata.json
- [ ] Configure bucket CORS (if needed)
- [ ] Set up IAM user with read-only access
- [ ] Add environment variables to Vercel
- [ ] Optional: Set up CloudFront for CDN
- [ ] Test API route locally
- [ ] Deploy to Vercel
- [ ] Test adding new trip (upload to S3, wait for revalidation)

---

## Benefits

✅ **No redeployment needed** - Upload to S3 and it appears (after ISR revalidation)  
✅ **Scalable** - Handle hundreds of trips easily  
✅ **Version control free** - No need to commit images to Git  
✅ **CDN delivery** - Fast image loading globally  
✅ **Easy content management** - Non-technical people can upload trips  
✅ **Portfolio value** - Demonstrates AWS, serverless, cloud architecture skills  

---

## Future Enhancements

1. **Admin Panel** - Upload trips via web interface instead of AWS Console
2. **Image Optimization** - Automatically resize/compress images on upload
3. **Search & Filter** - Filter by tags, location, date
4. **Trip Detail Pages** - `/interests/[tripId]` with full gallery
5. **Map Integration** - Show trips on an interactive map
6. **Analytics** - Track which trips get most views
7. **Caching Strategy** - Redis/Vercel KV for faster API responses

---

## Cost Estimate (AWS)

**For ~50 trips with 5 images each:**
- S3 Storage: ~$0.50/month (250 images × 2MB)
- S3 Requests: ~$0.10/month
- CloudFront: ~$1-5/month (depending on traffic)

**Total: ~$2-6/month** for dynamic, scalable trip management

---

## Alternative: Vercel Blob Storage

If you want to avoid AWS complexity, use Vercel's built-in blob storage:

```typescript
import { list } from '@vercel/blob';

export async function GET() {
  const { blobs } = await list();
  // Similar logic but with Vercel APIs
}
```

**Pros:** Simpler, integrated with Vercel  
**Cons:** Less control, potentially higher cost at scale

---

## Notes

- Start with ISR (revalidate: 3600) - trips appear within 1 hour of upload
- For real-time updates, use on-demand revalidation with webhooks
- Consider lazy loading images for better performance
- Add error boundaries for failed S3 requests
- Monitor S3 costs as traffic grows

---

**Created:** November 9, 2025  
**Status:** Planned  
**Priority:** Future Enhancement  
**Complexity:** Medium  
**Learning Value:** High (AWS, Serverless, Cloud Architecture)

