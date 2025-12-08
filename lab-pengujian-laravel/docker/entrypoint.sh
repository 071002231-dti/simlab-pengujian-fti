#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
while ! mysqladmin ping -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" --silent 2>/dev/null; do
    sleep 1
done
echo "Database is ready!"

# Run migrations
php artisan migrate --force

# Seed database if empty
php artisan db:seed --force 2>/dev/null || true

# Clear and optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
