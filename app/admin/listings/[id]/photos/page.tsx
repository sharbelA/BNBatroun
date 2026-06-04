import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Manage photos' }

export default async function ListingPhotosPage(
  props: PageProps<'/admin/listings/[id]/photos'>,
) {
  const { id } = await props.params

  // TODO: fetch listing_images ordered by display_order from Supabase
  // const supabase = await createClient()
  // const { data: images, error } = await supabase
  //   .from('listing_images')
  //   .select('*')
  //   .eq('listing_id', id)
  //   .order('display_order')

  return (
    <div className="mx-auto max-w-3xl">

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href={`/admin/listings/${id}/edit`}
          className="text-sm text-warm-500 hover:text-warm-900 transition-colors"
        >
          ← Back to edit
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-semibold text-warm-900">
        Manage photos
      </h1>
      <p className="mb-8 text-sm text-warm-500">
        Upload and reorder photos. Drag to set display order. First photo is the
        cover image.
      </p>

      {/* Upload area */}
      {/* TODO: wire to Cloudinary upload widget / next-cloudinary CldUploadWidget */}
      <div className="mb-8 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sand-300 bg-sand-50 px-6 py-10 text-center transition hover:border-sea-400 hover:bg-sea-50">
        <div className="mb-2 text-3xl text-warm-300">↑</div>
        <p className="text-sm font-medium text-warm-700">
          Click to upload or drag &amp; drop
        </p>
        <p className="mt-1 text-xs text-warm-400">PNG, JPG up to 10 MB each</p>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {/* Empty state */}
        <div className="col-span-full py-8 text-center text-sm text-warm-400">
          No photos yet. Upload the first one above.
        </div>

        {/* Populated grid item shape (rendered once data is wired):
        <div className="group relative aspect-video overflow-hidden rounded-xl bg-sand-100">
          <img src={url} alt={alt_text ?? ''} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/40 p-3 opacity-0 transition group-hover:opacity-100">
            <span className="text-xs font-medium text-white">#{display_order + 1}</span>
            <button className="text-xs font-medium text-red-300 hover:text-red-100">Remove</button>
          </div>
        </div>
        */}
      </div>

      {/* Save order — only needed once drag-reorder is implemented */}
      <div className="mt-8 flex gap-3 border-t border-sand-200 pt-6">
        <button
          type="button"
          disabled
          className="h-9 rounded-lg bg-sea-600 px-5 text-sm font-medium text-white opacity-40"
        >
          Save order
        </button>
        <p className="self-center text-xs text-warm-400">
          Drag photos to reorder, then save.
        </p>
      </div>

    </div>
  )
}
