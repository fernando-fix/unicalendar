<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventDraftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'calendar_id' => ['required', 'integer', 'exists:calendars,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'summary' => ['nullable', 'string'],
            'type' => ['required', 'in:meeting,deadline,exam,presentation,event,other'],
            'start_at' => ['nullable', 'date'],
            'location' => ['nullable', 'string', 'max:255'],
            'meeting_url' => ['nullable', 'url', 'max:500'],
        ];
    }
}
