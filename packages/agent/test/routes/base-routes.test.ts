import * as factories from '../__factories__';
import BaseRoute from '../../src/routes/base-route';

describe('Base routes', () => {
  const services = factories.forestAdminHttpDriverServices.build();
  const options = factories.forestAdminHttpDriverOptions.build();
  const router = factories.router.mockAllMethods().build();

  test('should not register any route', async () => {
    const baseRoute = new (class extends BaseRoute {})(services, options);
    await baseRoute.bootstrap();
    baseRoute.setupPublicRoutes(router);
    baseRoute.setupAuthentication(router);
    baseRoute.setupPrivateRoutes(router);

    expect(router.get).not.toHaveBeenCalled();
    expect(router.post).not.toHaveBeenCalled();
    expect(router.put).not.toHaveBeenCalled();
    expect(router.delete).not.toHaveBeenCalled();
    expect(router.use).not.toHaveBeenCalled();
  });
});
