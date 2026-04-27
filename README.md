# Biz-lego

Структурировал и дополнил проект так, чтобы его было проще запускать в превью.

## Текущая структура

- `archives/business_lego_all_parts.zip` — исходный архив со всеми частями.
- `pages/index.html` — стартовая страница-навигация по проекту.
- `pages/business_lego_3d.html` — 3D-версия конструктора.
- `pages/parts/business_lego_part1.html` … `business_lego_part5.html` — раздельные части.

## Быстрый запуск

### 0) В один клик (без сторонних сайтов и настроек)

```bash
./run_preview.sh
```

Скрипт сам откроет страницу предпросмотра: `http://localhost:8000/pages/`.
Можно указать свой порт: `./run_preview.sh 9000`.

#### Как запустить прямо сейчас

1. Откройте терминал в папке проекта:
   ```bash
   cd /workspace/Biz-lego
   ```
2. Дайте права на запуск (один раз):
   ```bash
   chmod +x run_preview.sh
   ```
3. Запустите предпросмотр:
   ```bash
   ./run_preview.sh
   ```
4. Чтобы остановить сервер, нажмите `Ctrl+C` в том же терминале.

### 1) Локально (рекомендуется)

```bash
python3 -m http.server 8000
```

Откройте:
- `http://localhost:8000/pages/`
- `http://localhost:8000/pages/business_lego_3d.html`

### 2) Из GitHub без скачивания

Лучший вариант — **GitHub Pages**:

1. В репозитории: `Settings → Pages`.
2. В `Source` выберите `Deploy from a branch`.
3. Branch: `main` (или нужную), Folder: `/root`, Save.
4. После публикации откройте:
   - `https://<username>.github.io/<repo>/pages/`
   - `https://<username>.github.io/<repo>/pages/business_lego_3d.html`

## Почему 3D может не запускаться в некоторых preview-сервисах

Сторонние preview-ссылки иногда ограничивают ES-модули, CDN-загрузки или WebGL. Поэтому для стабильной работы 3D используйте GitHub Pages или локальный сервер.
