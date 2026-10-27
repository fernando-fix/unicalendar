<?php

use Illuminate\Support\Env;

beforeEach(function () {
    Env::getRepository()->set('SETUP_TOKEN', 'segredo-teste');
});

afterEach(function () {
    Env::getRepository()->clear('SETUP_TOKEN');
});

test('rota /setup/{token} retorna 404 com token inválido', function () {
    $this->get('/setup/token-errado')->assertNotFound();
});

test('rota /setup/{token} retorna 404 quando SETUP_TOKEN não está definido', function () {
    Env::getRepository()->clear('SETUP_TOKEN');

    $this->get('/setup/segredo-teste')->assertNotFound();
});

test('rota /setup/{token} roda migrations com token correto', function () {
    $this->get('/setup/segredo-teste')
        ->assertOk()
        ->assertSee('<pre>', false);
});
