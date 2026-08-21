<?php

use App\Http\Controllers\AttendeeController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CalendarImportController;
use App\Http\Controllers\CalendarJoinRequestController;
use App\Http\Controllers\CalendarMembershipController;
use App\Http\Controllers\CalendarsController;
use App\Http\Controllers\CalendarSettingsController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Auth routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/settings', [SettingsController::class, 'show'])->name('settings');
    Route::put('/settings', [SettingsController::class, 'update']);
    Route::get('/settings/profile', [ProfileController::class, 'show'])->name('profile');
    Route::put('/settings/profile', [ProfileController::class, 'update']);
    Route::post('/settings/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::delete('/settings/profile/avatar', [ProfileController::class, 'destroyAvatar']);
    Route::put('/settings/password', [ProfileController::class, 'updatePassword'])->name('password');
});

// Calendar routes
Route::middleware('auth')->group(function () {
    Route::get('/calendars', [CalendarsController::class, 'index'])->name('calendars.index');
    Route::get('/calendar/create', [CalendarController::class, 'create'])->name('calendars.create');
    Route::post('/calendar', [CalendarController::class, 'store'])->name('calendars.store');
    Route::get('/calendar/import', [CalendarImportController::class, 'show'])->name('calendars.import');
    Route::post('/calendar/import', [CalendarImportController::class, 'store']);
    Route::put('/calendar/{calendar:uuid}', [CalendarController::class, 'update'])->name('calendars.update');
    Route::delete('/calendar/{calendar:uuid}', [CalendarController::class, 'destroy'])->name('calendars.destroy');
});

// Calendar settings
Route::middleware('auth')->group(function () {
    Route::get('/calendar/{calendar:uuid}/settings', [CalendarSettingsController::class, 'show'])->name('calendars.settings');
    Route::put('/calendar/{calendar:uuid}/settings', [CalendarSettingsController::class, 'update']);
});

// Calendar membership
Route::middleware('auth')->group(function () {
    Route::post('/calendar/{calendar:uuid}/join', [CalendarMembershipController::class, 'store'])->name('calendars.join');
    Route::delete('/calendar/{calendar:uuid}/leave', [CalendarMembershipController::class, 'destroy'])->name('calendars.leave');
    Route::delete('/calendar/{calendar:uuid}/members/{userId}', [CalendarMembershipController::class, 'remove'])->name('calendars.members.remove');
});

// Calendar join requests
Route::middleware('auth')->group(function () {
    Route::get('/calendar/{calendar:uuid}/requests', [CalendarJoinRequestController::class, 'index'])->name('calendars.requests');
    Route::put('/calendar/{calendar:uuid}/requests/{joinRequest}/approve', [CalendarJoinRequestController::class, 'approve'])->name('calendars.requests.approve');
    Route::put('/calendar/{calendar:uuid}/requests/{joinRequest}/reject', [CalendarJoinRequestController::class, 'reject'])->name('calendars.requests.reject');
});

// Calendar public view (works for both authenticated and guest)
Route::get('/calendar/{calendar:uuid}', [CalendarController::class, 'show'])->name('calendars.show');

// Event routes
Route::middleware('auth')->group(function () {
    Route::get('/events/create', [EventController::class, 'quickCreate'])->name('events.quick-create');
    Route::get('/calendar/{calendar:uuid}/events/create', [EventController::class, 'create'])->name('events.create');
    Route::post('/calendar/{calendar:uuid}/events', [EventController::class, 'store'])->name('events.store');
    Route::post('/calendar/{calendar:uuid}/events/batch', [EventController::class, 'storeBatch'])->name('events.store-batch');
    Route::get('/calendar/{calendar:uuid}/events/{event}/edit', [EventController::class, 'edit'])->name('events.edit');
    Route::put('/calendar/{calendar:uuid}/events/{event}', [EventController::class, 'update'])->name('events.update');
    Route::delete('/calendar/{calendar:uuid}/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
});

Route::get('/calendar/{calendar:uuid}/events/{event}', [EventController::class, 'show'])->name('events.show');

// Attendance
Route::middleware('auth')->group(function () {
    Route::post('/calendar/{calendar:uuid}/events/{event}/attend', [AttendeeController::class, 'store'])->name('events.attend');
});

// Comments
Route::middleware('auth')->group(function () {
    Route::post('/calendar/{calendar:uuid}/events/{event}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::delete('/calendar/{calendar:uuid}/events/{event}/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
});
