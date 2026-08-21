<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('calendars', function (Blueprint $table) {
            $table->string('uuid')->nullable()->unique()->after('id');
        });

        // Backfill existing rows with UUIDs
        foreach (DB::table('calendars')->select('id')->get() as $calendar) {
            DB::table('calendars')
                ->where('id', $calendar->id)
                ->update(['uuid' => Str::uuid7()]);
        }
    }

    public function down(): void
    {
        Schema::table('calendars', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
