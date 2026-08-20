<?php

namespace Database\Factories;

use App\Models\Calendar;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Calendar>
 */
class CalendarFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->sentence();

        return [
            'owner_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->optional()->paragraph(),
            'visibility' => fake()->randomElement(['public', 'private']),
            'allow_member_event_creation' => true,
        ];
    }
}
