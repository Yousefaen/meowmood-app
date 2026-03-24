import { useState } from 'react'
import { FeedingForm } from '@/components/feeding/FeedingForm'
import { FeedingList } from '@/components/feeding/FeedingList'
import type { FeedingLog } from '@/types'

const demoFeedings: FeedingLog[] = [
  {
    id: '1',
    pet_id: 'luna',
    fed_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    food_type: 'Wet food - Chicken',
    notes: 'Ate about half the portion',
  },
  {
    id: '2',
    pet_id: 'luna',
    fed_at: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    food_type: 'Dry kibble',
    notes: null,
  },
  {
    id: '3',
    pet_id: 'luna',
    fed_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    food_type: 'Wet food - Tuna',
    notes: 'Finished everything!',
  },
]

export default function Feeding() {
  const [feedings, setFeedings] = useState<FeedingLog[]>(demoFeedings)

  function handleAddFeeding(entry: Omit<FeedingLog, 'id' | 'pet_id'>) {
    const newEntry: FeedingLog = {
      ...entry,
      id: crypto.randomUUID(),
      pet_id: 'luna',
    }
    setFeedings((prev) => [newEntry, ...prev])
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <span>🍽️</span>
          <span>Feeding Log</span>
        </h1>
      </header>

      <div className="flex flex-col gap-6">
        <FeedingForm onSubmit={handleAddFeeding} />
        <FeedingList feedings={feedings} />
      </div>
    </div>
  )
}
