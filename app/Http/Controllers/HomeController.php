<?php

namespace App\Http\Controllers;

use App\Models\Calendar;
use App\Models\Event;
use App\Models\User;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('welcome', [
            'stats' => [
                'users' => User::count(),
                'calendars' => Calendar::count(),
                'events' => Event::count(),
            ],
        ]);
    }
}
