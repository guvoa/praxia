<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\{{Name}};

final class {{Name}}Controller extends Controller
{
    public function index(): void
    {
        $items = {{Name}}::all();

        $this->render('{{module}}/index', [
            'title' => '{{Name}}',
            'items' => $items,
        ]);
    }

    public function show(string $id): void
    {
        $item = {{Name}}::find((int) $id);

        if ($item === null) {
            $this->notFound();
            return;
        }

        $this->render('{{module}}/show', [
            'title' => '{{Name}}',
            'item'  => $item,
        ]);
    }
}
