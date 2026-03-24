import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { FeedingLog } from '@/types'

interface FeedingFormProps {
  onSubmit: (entry: Omit<FeedingLog, 'id' | 'pet_id'>) => void
}

export function FeedingForm({ onSubmit }: FeedingFormProps) {
  const [foodType, setFoodType] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      fed_at: new Date().toISOString(),
      food_type: foodType.trim() || null,
      notes: notes.trim() || null,
    })
    setFoodType('')
    setNotes('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a Feeding</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="food-type" className="text-sm font-medium">
              Food type
            </label>
            <Input
              id="food-type"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              placeholder="e.g., Wet food, Dry kibble, Treats"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes..."
            />
          </div>
          <Button type="submit" className="self-end">
            Log Feeding
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
