<?php

namespace Database\Factories;

use App\Models\Calendar;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    public function definition(): array
    {
        $startAt = Carbon::now()->addDays(rand(1, 30))->addHours(rand(0, 23));

        return [
            'calendar_id' => Calendar::factory(),
            'creator_id' => User::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->optional()->paragraph(),
            'type' => fake()->randomElement(['meeting', 'deadline', 'exam', 'presentation', 'event', 'other']),
            'start_at' => $startAt,
            'end_at' => fake()->optional()->dateTimeBetween($startAt, $startAt->copy()->addHours(4)),
            'location' => fake()->optional()->address(),
            'meeting_url' => fake()->optional()->url(),
        ];
    }
}
