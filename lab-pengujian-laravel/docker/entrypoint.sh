#!/bin/sh
set -e

# Create .env file if it doesn't exist
if [ ! -f /var/www/html/.env ]; then
    echo "Creating .env file from .env.example..."
    cp /var/www/html/.env.example /var/www/html/.env
    echo ".env file created successfully"
fi

# Update .env with environment variables if they exist
if [ -n "$APP_KEY" ]; then
    sed -i "s|APP_KEY=.*|APP_KEY=$APP_KEY|" /var/www/html/.env
fi
if [ -n "$DB_HOST" ]; then
    sed -i "s|DB_HOST=.*|DB_HOST=$DB_HOST|" /var/www/html/.env
fi
if [ -n "$DB_PORT" ]; then
    sed -i "s|DB_PORT=.*|DB_PORT=$DB_PORT|" /var/www/html/.env
fi
if [ -n "$DB_DATABASE" ]; then
    sed -i "s|DB_DATABASE=.*|DB_DATABASE=$DB_DATABASE|" /var/www/html/.env
fi
if [ -n "$DB_USERNAME" ]; then
    sed -i "s|DB_USERNAME=.*|DB_USERNAME=$DB_USERNAME|" /var/www/html/.env
fi
if [ -n "$DB_PASSWORD" ]; then
    sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" /var/www/html/.env
fi
if [ -n "$FRONTEND_URL" ]; then
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=$FRONTEND_URL|" /var/www/html/.env
fi
if [ -n "$SANCTUM_STATEFUL_DOMAINS" ]; then
    sed -i "s|SANCTUM_STATEFUL_DOMAINS=.*|SANCTUM_STATEFUL_DOMAINS=$SANCTUM_STATEFUL_DOMAINS|" /var/www/html/.env
fi
if [ -n "$GOOGLE_CLIENT_ID" ]; then
    sed -i "s|GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID|" /var/www/html/.env
fi
if [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    sed -i "s|GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET|" /var/www/html/.env
fi
if [ -n "$GOOGLE_REDIRECT_URI" ]; then
    sed -i "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=$GOOGLE_REDIRECT_URI|" /var/www/html/.env
fi

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
