<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBatchEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'type' => ['required', 'in:meeting,deadline,exam,presentation,event,other'],
            'location' => ['nullable', 'string', 'max:255'],
            'meeting_url' => ['nullable', 'url', 'max:500'],
            'dates' => ['required', 'array', 'min:1', 'max:30'],
            'dates.*.start_at' => ['required', 'date'],
            'dates.*.end_at' => ['nullable', 'date', 'after_or_equal:dates.*.start_at'],
        ];
    }
}
