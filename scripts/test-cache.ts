const { getReadClient, getWriteClient, closeRedisConnections } = require('../src/lib/redis-cache');
const { logger } = require('../src/lib/logger');

async function testCache() {
  try {
    // 1. Connect to Redis
    const readClient = await getReadClient();
    const writeClient = await getWriteClient();
    logger.info('✅ Redis connections successful');

    // 2. List all cache keys (using read client)
    const contentKeys = await readClient.keys('content:*');
    const customerStoryKeys = await readClient.keys('customer-stories:*');

    logger.info('📊 Cache Statistics:');
    logger.info(`Content cache entries: ${contentKeys.length}`);
    logger.info(`Customer story cache entries: ${customerStoryKeys.length}`);

    // 3. Sample some cache entries
    if (contentKeys.length > 0) {
      const sampleKey = contentKeys[0];
      const value = await readClient.get(sampleKey);
      logger.info('\n📝 Sample content cache entry:');
      logger.info(`Key: ${sampleKey}`);
      logger.info(`Value: ${value?.substring(0, 100)}...`);
    }

    if (customerStoryKeys.length > 0) {
      const sampleKey = customerStoryKeys[0];
      const value = await readClient.get(sampleKey);
      logger.info('\n📝 Sample customer story cache entry:');
      logger.info(`Key: ${sampleKey}`);
      logger.info(`Value: ${value?.substring(0, 100)}...`);
    }

    // 4. Get TTL for sample entries
    if (contentKeys.length > 0) {
      const sampleKey = contentKeys[0];
      const ttl = await readClient.ttl(sampleKey);
      logger.info(`\n⏱️ TTL for content cache: ${ttl} seconds`);
    }

    if (customerStoryKeys.length > 0) {
      const sampleKey = customerStoryKeys[0];
      const ttl = await readClient.ttl(sampleKey);
      logger.info(`⏱️ TTL for customer story cache: ${ttl} seconds`);
    }

    // 5. Test write operation
    const testKey = 'test:write-operation';
    await writeClient.setEx(testKey, 60, 'test value');
    const testValue = await readClient.get(testKey);
    logger.info('\n✍️ Write test:');
    logger.info(`Write successful: ${testValue === 'test value'}`);
    await writeClient.del(testKey);

    // 6. Close connections
    await closeRedisConnections();
    logger.info('\n👋 Redis connections closed');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Cache test failed:', error);
    await closeRedisConnections();
    process.exit(1);
  }
}

testCache(); 