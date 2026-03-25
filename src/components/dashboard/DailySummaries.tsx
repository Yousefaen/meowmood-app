import { Card, CardContent } from '@/components/ui/card';

interface DailySummariesProps {
  activityScore: number;
  steps: number;
  heartRate: number;
  temperature: number;
}

interface Summary {
  icon: string;
  title: string;
  text: string;
  color: string;
}

function getActivitySummary(score: number, steps: number): Summary {
  let text: string;
  if (score >= 80) {
    text = `Erbao has been very active today! He's been stretching, walking, and running around. With ${steps.toLocaleString()} steps and an activity score of ${score}, he's getting plenty of exercise.`;
  } else if (score >= 50) {
    text = `Erbao has had a moderately active day so far. He's been moving around at a comfortable pace with ${steps.toLocaleString()} steps. A good mix of play and rest.`;
  } else {
    text = `Erbao has been taking it easy today with only ${steps.toLocaleString()} steps. He may be feeling lazy or conserving energy — a play session could help perk him up.`;
  }
  return { icon: '🏃', title: 'Activity', text, color: 'var(--meow-green)' };
}

function getSleepSummary(heartRate: number, activityScore: number): Summary {
  let text: string;
  if (heartRate < 70 && activityScore < 40) {
    text = 'Erbao has been resting well today with a calm heart rate and low activity. He seems to be getting the deep rest he needs to recharge.';
  } else if (heartRate > 90) {
    text = 'Erbao has been taking shorter naps today with an elevated heart rate. Something may be disrupting his sleep — check for any environmental changes or stressors.';
  } else if (activityScore > 70) {
    text = "Erbao's been so active today that his nap time has been shorter than usual. He'll likely crash for a longer rest later tonight.";
  } else {
    text = "Erbao has had a balanced rest pattern today. He's been alternating between light naps and gentle activity — a healthy rhythm for a cat.";
  }
  return { icon: '😴', title: 'Sleep', text, color: 'var(--meow-purple)' };
}

function getMoodSummary(activityScore: number, heartRate: number, temperature: number): Summary {
  const tempNormal = temperature >= 100.5 && temperature <= 102.5;
  const hrCalm = heartRate < 100;
  const activeEnough = activityScore >= 40;

  let text: string;
  if (tempNormal && hrCalm && activeEnough) {
    text = "Erbao is in a great mood today! With a healthy temperature, calm heart rate, and good balance of sleep and activity, he's one happy cat.";
  } else if (!tempNormal) {
    text = `Erbao's temperature is at ${temperature}°F which is outside the normal range. He may be feeling under the weather — keep an eye on him and consider a vet check if it persists.`;
  } else if (!hrCalm) {
    text = "Erbao seems a bit stressed or overstimulated today with an elevated heart rate. Try creating a calm environment with some quiet time or soothing music.";
  } else {
    text = "Erbao seems a little low-energy today. He might benefit from some interactive play or a change of scenery to lift his spirits.";
  }
  return { icon: '😸', title: 'Mood', text, color: 'var(--meow-pink)' };
}

export default function DailySummaries({ activityScore, steps, heartRate, temperature }: DailySummariesProps) {
  const summaries: Summary[] = [
    getActivitySummary(activityScore, steps),
    getSleepSummary(heartRate, activityScore),
    getMoodSummary(activityScore, heartRate, temperature),
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Daily Summary
      </h3>
      {summaries.map((s) => (
        <Card key={s.title}>
          <CardContent className="flex gap-3 py-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
              style={{ backgroundColor: `color-mix(in oklch, ${s.color} 15%, transparent)` }}
            >
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                {s.text}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
