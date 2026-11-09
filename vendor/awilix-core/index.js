export function createContainer() {
  const registrations = new Map();
  return {
    register: (name, reg) => {
      if (typeof name === 'object') {
        Object.entries(name).forEach(([k, v]) => registrations.set(k, v));
      } else {
        registrations.set(name, reg);
      }
    },
    resolve: (name) => {
      const reg = registrations.get(name);
      return typeof reg?.resolve === 'function' ? reg.resolve() : reg?.value;
    },
    cradle: new Proxy({}, {
      get: (_, prop) => {
        const reg = registrations.get(prop);
        return typeof reg?.resolve === 'function' ? reg.resolve() : reg?.value;
      }
    })
  };
}

export function asValue(value) {
  return { value, resolve: () => value };
}

export function asClass(ClassDef) {
  let instance;
  return {
    resolve: () => {
      if (!instance) instance = new ClassDef();
      return instance;
    }
  };
}

export function asFunction(fn) {
  let instance;
  return {
    resolve: () => {
      if (!instance) instance = fn();
      return instance;
    }
  };
}

export const Lifetime = {
  SCOPED: 'SCOPED',
  SINGLETON: 'SINGLETON',
  TRANSIENT: 'TRANSIENT',
};

export const InjectionMode = {
  PROXY: 'PROXY',
  CLASSIC: 'CLASSIC',
};
