#!/bin/bash

echo "🚀 Despliegue optimizado para Heroku - Build Local"

# 1. Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf dist/ build/

# 2. Build local con memoria optimizada
echo "🔨 Haciendo build local..."
export NODE_OPTIONS='--max-old-space-size=2048'
npm run build

# 3. Verificar que el build fue exitoso
if [ ! -d "dist" ] && [ ! -d "build" ]; then
    echo "❌ Error: Build falló. Verificar errores."
    exit 1
fi

echo "✅ Build local exitoso!"

# 4. Comentar temporalmente .gitignore
echo "📝 Modificando .gitignore temporalmente..."
sed -i 's/^dist\//#dist\//' .gitignore
sed -i 's/^build\//#build\//' .gitignore

# 5. Git add y commit
echo "📦 Preparando commit..."
git add .
git commit -m "Build local exitoso - archivos compilados para Heroku"

# 6. Push a Heroku
echo "🚀 Desplegando a Heroku..."
git push heroku main

# 7. Restaurar .gitignore
echo "🔄 Restaurando .gitignore..."
sed -i 's/^#dist\//dist\//' .gitignore
sed -i 's/^#build\//build\//' .gitignore

echo "✅ Despliegue completado!"
echo "📊 Verificar logs: heroku logs --tail"
