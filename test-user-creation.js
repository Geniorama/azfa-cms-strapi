// Script de prueba para verificar el lifecycle de usuarios
// Este script simula la creación de un usuario para probar el envío de email

const testUser = {
  username: 'test_user_' + Date.now(),
  email: 'test@example.com',
  password: 'TestPassword123!',
  confirmed: true,
  role: {
    type: 'authenticated'
  }
};

console.log('🧪 Script de prueba para lifecycle de usuarios');
console.log('📋 Datos del usuario de prueba:');
console.log(JSON.stringify(testUser, null, 2));
console.log('');
console.log('📝 Para probar el lifecycle:');
console.log('1. Ve al panel de admin de Strapi: http://localhost:1337/admin');
console.log('2. Navega a Content Manager > Users');
console.log('3. Crea un nuevo usuario con los siguientes datos:');
console.log(`   - Username: ${testUser.username}`);
console.log(`   - Email: ${testUser.email}`);
console.log(`   - Password: ${testUser.password}`);
console.log('   - Role: Authenticated');
console.log('   - Confirmed: true ✅');
console.log('');
console.log('4. Guarda el usuario');
console.log('5. Revisa los logs del servidor para ver los mensajes del lifecycle');
console.log('6. Verifica que se envíe el email de restablecimiento');
console.log('');
console.log('🔍 Logs esperados:');
console.log('   - "🔄 Lifecycle afterCreate ejecutado para usuario: test@example.com"');
console.log('   - "📊 Datos del usuario - confirmed: true, role: authenticated"');
console.log('   - "Usuario confirmado detectado: test@example.com (rol: authenticated)"');
console.log('   - "Email de restablecimiento enviado al usuario: test@example.com"');

