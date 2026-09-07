<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::group([
    'middleware' => 'auth'
], function () {

    Route::get('/artisan-migrate', function () {
        try {
            Artisan::call('migrate', ['--force' => true]);
            $output = Artisan::output();
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ]);
        }
        return response()->json([
            'success' => true,
            'message' => 'Comando de migração executado com sucesso!',
            'data' => [
                'lines' => array_filter(explode("\n", $output))
            ]
        ], 200, [], JSON_PRETTY_PRINT);
    });

    Route::get('/artisan-seed', function () {
        try {
            Artisan::call('db:seed', ['--force' => true]);
            $output = Artisan::output();
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ]);
        }
        return response()->json([
            'success' => true,
            'message' => 'Comando de seed executado com sucesso!',
            'data' => [
                'lines' => array_filter(explode("\n", $output))
            ]
        ], 200, [], JSON_PRETTY_PRINT);
    });

    Route::get('/artisan-link', function () {
        try {
            Artisan::call('storage:link');
            $output = Artisan::output();
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ]);
        }
        return response()->json([
            'success' => true,
            'message' => 'Comando de link executado com sucesso!',
            'data' => [
                'lines' => array_filter(explode("\n", $output))
            ]
        ], 200, [], JSON_PRETTY_PRINT);
    });
});
