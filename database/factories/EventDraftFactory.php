<?php

namespace Database\Factories;

use App\Models\Calendar;
use App\Models\EventDraft;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventDraft>
 */
class EventDraftFactory extends Factory
{
    public function definition(): array
    {
        return [
            'calendar_id' => Calendar::factory(),
            'creator_id' => User::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->optional()->paragraph(),
            'summary' => fake()->optional()->paragraph(),
            'type' => fake()->randomElement(['meeting', 'deadline', 'exam', 'presentation', 'event', 'other']),
            'start_at' => null,
            'location' => fake()->optional()->address(),
            'meeting_url' => fake()->optional()->url(),
        ];
    }
}
