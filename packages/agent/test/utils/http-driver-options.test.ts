import OptionsValidator from '../../src/utils/options-validator';

describe('OptionsValidator', () => {
  const mandatoryOptions = {
    authSecret: '2536a2f786fc98a1ee62f9e9f405ff2521181cd01e15adcc',
    envSecret: '61a31971206f285c3e8eb8f3ee420175eb004bfa9fa24846dde6d5dd438e3991',
    isProduction: false,
  };

  describe('withDefaults', () => {
    test('should add default values when they are missing', () => {
      const options = OptionsValidator.withDefaults(mandatoryOptions);

      expect(options).toHaveProperty('forestServerUrl', 'https://api.forestadmin.com');
      expect(options).toHaveProperty('logger', expect.any(Function));
      expect(options).toHaveProperty('prefix', '');
      expect(options).toHaveProperty('schemaPath', '.forestadmin-schema.json');
      expect(options).toHaveProperty('typingsMaxDepth', 5);
      expect(options).toHaveProperty('permissionsCacheDurationInSeconds', 900);
      expect(options).toHaveProperty('skipSchemaUpdate', false);
    });

    test('logger should be callable', () => {
      jest.spyOn(console, 'error').mockReturnValue();

      const options = OptionsValidator.withDefaults(mandatoryOptions);

      options.logger('Info', 'hello!');
      expect(console.error).toHaveBeenCalled();
    });

    test('should not overwrite existing values', () => {
      const options = OptionsValidator.withDefaults({
        ...mandatoryOptions,
        forestServerUrl: 'https://api.development.forestadmin.com',
      });

      expect(options).toHaveProperty('forestServerUrl', 'https://api.development.forestadmin.com');
    });

    test('should force to set a default forestServerUrl when null is passed', () => {
      const options = OptionsValidator.withDefaults({
        ...mandatoryOptions,
        forestServerUrl: null,
      });

      expect(options).toHaveProperty('forestServerUrl', 'https://api.forestadmin.com');
    });

    test('should force to set a default schemaPath when null is passed', () => {
      const options = OptionsValidator.withDefaults({
        ...mandatoryOptions,
        schemaPath: null,
      });

      expect(options).toHaveProperty('schemaPath', '.forestadmin-schema.json');
    });

    test('should force to set a default logger when null is passed', () => {
      const options = OptionsValidator.withDefaults({
        ...mandatoryOptions,
        logger: null,
      });

      expect(options).toHaveProperty('logger', expect.any(Function));
    });

    test('should do not modify the given option', () => {
      const options = OptionsValidator.withDefaults({
        ...mandatoryOptions,
        schemaPath: null,
      });

      expect(options).toEqual(options);
    });

    describe('permissionsCacheDurationInSeconds', () => {
      test('should force minimum value to 1 minute (forest server performance concerns)', () => {
        const options = OptionsValidator.withDefaults({
          ...mandatoryOptions,
          logger: jest.fn(),
          permissionsCacheDurationInSeconds: 1,
        });

        expect(options).toHaveProperty('permissionsCacheDurationInSeconds', 60);
        expect(options.logger).toHaveBeenCalledWith(
          'Warn',
          'ignoring options.permissionsCacheDurationInSeconds: minimum value is 60 seconds',
        );
      });

      test('should allow user to configure it with realistic value', () => {
        const options = OptionsValidator.withDefaults({
          ...mandatoryOptions,
          permissionsCacheDurationInSeconds: 5 * 60,
        });

        expect(options).toHaveProperty('permissionsCacheDurationInSeconds', 300);
      });
    });
  });

  describe('OptionsValidator.validate', () => {
    const allOptions = {
      ...mandatoryOptions,
      forestServerUrl: 'https://api.development.forestadmin.com',
      logger: () => {},
      loggerLevel: 'Debug',
      prefix: '/myPrefix',
      schemaPath: '.forestadmin-schema.json',
      permissionsCacheDurationInSeconds: 12,
      typingsPath: null,
      typingsMaxDepth: 5,
    } as const;

    test('should work with good format', () => {
      expect(() => OptionsValidator.validate(allOptions)).not.toThrow();
    });

    describe.each(['schemaPath', 'typingsPath'])('%s', path => {
      test('should fail on a folder which does not exists', () => {
        expect(() =>
          OptionsValidator.validate({
            ...allOptions,
            [path]: '/i_dont_exist/file',
          }),
        ).toThrow(`options.${path} is invalid.`);
      });
    });

    describe.each(['authSecret', 'envSecret', 'forestServerUrl', 'prefix', 'schemaPath'])(
      '%s',
      key => {
        test('should fail with null', () => {
          expect(() => OptionsValidator.validate({ ...allOptions, [key]: null })).toThrow(
            `options.${key} is invalid.`,
          );
        });
      },
    );

    describe.each(['authSecret', 'envSecret', 'forestServerUrl', 'prefix', 'schemaPath'])(
      '%s',
      key => {
        test('should fail with number', () => {
          expect(() =>
            OptionsValidator.validate({ ...allOptions, [key]: 123 as unknown as string }),
          ).toThrow(`options.${key} is invalid.`);
        });
      },
    );

    describe.each(['envSecret', 'forestServerUrl'])('%s', key => {
      test('should fail with bad format', () => {
        expect(() => OptionsValidator.validate({ ...allOptions, [key]: '123' })).toThrow(
          `options.${key} is invalid.`,
        );
      });
    });

    test('should fail when prefix contains not allowed characters', () => {
      expect(() =>
        OptionsValidator.validate({
          ...allOptions,
          prefix: 'this-should#fail&as-a-prefix!',
        }),
      ).toThrow(
        'options.prefix is invalid. It should contain the prefix on which ' +
          'forest admin routes should be mounted (i.e. "/api/v1")',
      );
    });

    test('should work when prefix is valid', () => {
      const testPrefix = prefix =>
        expect(() =>
          OptionsValidator.validate({
            ...allOptions,
            prefix,
          }),
        ).not.toThrow();

      testPrefix('api/~v1');
      testPrefix('api/version-1');
      testPrefix('foo/bar/baz');
      testPrefix('foo_bar');
    });
  });
});
