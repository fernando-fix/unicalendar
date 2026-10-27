<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\HttpFoundation\Response;

class SetupController extends Controller
{
    public function run(Request $request, string $token): Response
    {
        $expected = (string) env('SETUP_TOKEN', '');

        if (empty($expected) || ! hash_equals($expected, $token)) {
            abort(404);
        }

        $action = $request->query('action', 'migrate');

        $command = match ($action) {
            'fresh' => 'migrate:fresh',
            'fresh-seed' => 'migrate:fresh',
            'migrate' => 'migrate',
            default => null,
        };

        if ($command === null) {
            abort(400, 'Ação inválida. Use ?action=migrate, ?action=fresh ou ?action=fresh-seed.');
        }

        $params = [];
        if (str_ends_with($action, '-seed')) {
            $params['--seed'] = true;
        }

        Artisan::call($command, $params);
        $output = Artisan::output();

        return response("<pre>{$output}</pre>", 200, ['Content-Type' => 'text/html']);
    }
}
