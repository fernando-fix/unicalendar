<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Calendar;
use App\Models\Comment;
use App\Models\Event;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, Calendar $calendar, Event $event)
    {
        $event->comments()->create([
            'user_id' => auth()->id(),
            'body' => $request->body,
        ]);

        return back();
    }

    public function destroy(Calendar $calendar, Event $event, Comment $comment)
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return back();
    }
}
