import { use } from 'react'

type ServiceItem = {
  id: string
  title: string
  description: string
  priceRange: string
}

const SERVICES_BY_SLUG: Record<string, { title: string; description?: string; items: ServiceItem[] }> = {
  signages: {
    title: 'Signages',
    description: 'Various types of signages for indoor and outdoor use.',
    items: [
      {
        id: 'acrylic-build-up',
        title: 'Acrylic Build Up',
        description: 'Layered acrylic letters or shapes for a premium 3D look.',
        priceRange: '₱2,500 - ₱10,000',
      },
      {
        id: 'panaflex',
        title: 'Panaflex',
        description: 'Flexible printed vinyl signboard for large-format outdoor signs.',
        priceRange: '₱1,200 - ₱8,000',
      },
      {
        id: 'acrylic-light-box',
        title: 'Acrylic Light Box',
        description: 'Backlit acrylic panels in a slim lightbox frame.',
        priceRange: '₱3,500 - ₱18,000',
      },
      {
        id: 'neon-lights',
        title: 'Neon Lights',
        description: 'Custom neon or LED neon-style signage for eye-catching displays.',
        priceRange: '₱4,000 - ₱25,000',
      },
    ],
  },
}

export default function Services({ params }: { params: Promise<{ slug: string | string[] }> }) {
  const { slug } = use(params)
  const slugKey = Array.isArray(slug) ? slug[0] : slug
  const data = SERVICES_BY_SLUG[slugKey?.toLowerCase() ?? '']

  return (
    <div className='py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        <h1 className='capitalize font-extrabold text-3xl'>{slugKey}</h1>
        <p className='text-sm text-muted-foreground mt-2'>{data?.description ?? 'Select a service to see details.'}</p>

        {!data && (
          <div className='mt-6'>
            <p>No detailed services found for this category.</p>
          </div>
        )}

        {data && (
          <div className='mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
            {data.items.map((item, i) => (
              <article key={item.id} className='flex flex-col justify-between border rounded-lg overflow-hidden shadow-sm bg-white'>
                <div className='w-full h-60 bg-gray-100'>
                  <img
                    src={`https://picsum.photos/600?random=${i}`}
                    alt={item.title}
                    className='w-full h-full object-cover min-h-60'
                  />
                </div>
                <div className='p-4 h-full flex flex-col'>
                  <h3 className='font-semibold text-lg'>{item.title}</h3>
                  <p className='text-sm text-muted-foreground mt-2 mb-auto'>{item.description}</p>
                  <div className='mt-auto flex items-center justify-between'>
                    <span className='text-sm font-medium'>{item.priceRange}</span>
                    <button className='px-3 py-1 rounded-md bg-primary text-white text-sm'>Inquire</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

