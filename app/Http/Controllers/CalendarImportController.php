<?php

namespace App\Http\Controllers;

use App\Enums\CalendarRole;
use App\Models\Calendar;
use App\Models\Event;
use ICal\ICal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CalendarImportController extends Controller
{
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private const MAX_EVENTS = 500;

    private const ALLOWED_MIMES = ['text/calendar', 'application/ics', 'application/x-ical'];

    public function show()
    {
        return Inertia::render('calendar/import');
    }

    public function store(Request $request)
    {
        $request->validate([
            'ics_file' => ['required', 'file', 'mimetypes:text/calendar,application/ics,application/x-ical', 'max:'.(self::MAX_FILE_SIZE / 1024)],
            'name' => ['nullable', 'string', 'max:255'],
            'visibility' => ['required', 'in:public,private'],
        ]);

        $file = $request->file('ics_file');

        try {
            $icalContent = file_get_contents($file->getPathname());
            $ical = new ICal;
            $ical->initString($icalContent, [
                'unfoldSpreadlines' => true,
                'createUNTILDateTimeObjects' => false,
                'filterDaysAfter' => 365,
                'filterDaysBefore' => 365,
            ]);

            if (! $ical->hasEvents()) {
                return back()->withErrors([
                    'ics_file' => 'O arquivo ICS não contém eventos.',
                ]);
            }

            $events = $ical->events();

            if (count($events) > self::MAX_EVENTS) {
                return back()->withErrors([
                    'ics_file' => 'O arquivo ICS contém muitos eventos (máximo: '.self::MAX_EVENTS.').',
                ]);
            }

            $calendarName = $request->input('name')
                ?? $ical->calendarName()
                ?? 'Calendário Importado';

            $user = Auth::user();

            $calendar = Calendar::create([
                'owner_id' => $user->id,
                'name' => $calendarName,
                'slug' => Calendar::generateUniqueSlug($calendarName),
                'description' => $ical->calendarDescription() ?? 'Importado de arquivo ICS',
                'visibility' => $request->visibility,
            ]);

            $calendar->members()->attach($user->id, ['role' => CalendarRole::Owner->value]);

            $mappedEvents = [];
            foreach ($events as $icalEvent) {
                $start = $ical->iCalDateToDateTime($icalEvent->dtstart);
                $end = isset($icalEvent->dtend)
                    ? $ical->iCalDateToDateTime($icalEvent->dtend)
                    : null;

                $mappedEvents[] = [
                    'calendar_id' => $calendar->id,
                    'creator_id' => $user->id,
                    'title' => $icalEvent->summary ?? 'Sem título',
                    'description' => $icalEvent->description ?? null,
                    'type' => $this->guessType($icalEvent->summary ?? '', $icalEvent->description ?? ''),
                    'start_at' => $start->format('Y-m-d H:i:s'),
                    'end_at' => $end?->format('Y-m-d H:i:s'),
                    'location' => $icalEvent->location ?? null,
                    'meeting_url' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            Event::insert($mappedEvents);

            return redirect()->route('calendars.show', $calendar->slug)
                ->with('success', count($mappedEvents).' eventos importados com sucesso.');
        } catch (\Exception $e) {
            return back()->withErrors([
                'ics_file' => 'Erro ao processar o arquivo ICS: '.$e->getMessage(),
            ]);
        }
    }

    private function guessType(string $summary, string $description): string
    {
        $text = strtolower($summary.' '.$description);

        if (str_contains($text, 'reunião') || str_contains($text, 'meeting') || str_contains($text, 'standup') || str_contains($text, 'sprint')) {
            return 'meeting';
        }

        if (str_contains($text, 'prazo') || str_contains($text, 'deadline') || str_contains($text, 'entrega') || str_contains($text, 'due')) {
            return 'deadline';
        }

        if (str_contains($text, 'prova') || str_contains($text, 'exam') || str_contains($text, 'avaliação') || str_contains($text, 'test')) {
            return 'exam';
        }

        if (str_contains($text, 'apresentação') || str_contains($text, 'presentation') || str_contains($text, 'defesa') || str_contains($text, 'defesa')) {
            return 'presentation';
        }

        return 'other';
    }
}
