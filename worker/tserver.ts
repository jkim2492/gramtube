export type Responder = (...args: any[]) => Promise<Response>;
export const SW = self as unknown as ServiceWorkerGlobalScope;

export class Router {
  static routeMap: {
    GET: Record<string, Responder>;
    POST: Record<string, Responder>;
    HEAD: Record<string, Responder>;
  } = {
    GET: {},
    POST: {},
    HEAD: {},
  };

  static getParams(url: URL) {
    const queryParams = url.searchParams;
    let params: Record<string, any> = {};

    for (let [key, value] of queryParams.entries()) {
      params[key] = value;
    }

    return params;
  }

  static get(path: string) {
    return function (
      _target: any,
      _propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      Router.routeMap["GET"][path] = descriptor.value;
      return descriptor.value;
    };
  }

  static head(path: string) {
    return function (
      _target: any,
      _propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      Router.routeMap["HEAD"][path] = descriptor.value;
      return descriptor.value;
    };
  }

  static fetchHandler(event: FetchEvent) {
    var url = new URL(event.request.url);

    var params = Router.getParams(url);
    for (let [method, routes] of Object.entries(Router.routeMap)) {
      if (event.request.method == method) {
        for (let [path, fn] of Object.entries(routes)) {
          if (Router.urlMatch(url, path)) {
            if (fn.length == 1) {
              event.respondWith(fn(event));
              return;
            } else {
              event.respondWith(fn(event, params));
              return;
            }
          }
        }
      }
    }
  }

  static urlMatch(url: URL, path: string) {
    return url.pathname == path;
  }

  static startListener() {
    SW.addEventListener("fetch", Router.fetchHandler);
  }
}

export class Controller {
  static client?: Client;
  static clientResolve: any;
  static clientPromise: Promise<Client> = new Promise((resolve) => {
    Controller.clientResolve = resolve;
  });

  static async getClient() {
    if (Controller.client !== undefined) {
      return Controller.client;
    }
    return Controller.clientPromise;
  }

  static async run(functionName: string, ...args: any[]) {
    const data = {
      functionName,
      args,
    };
    return await Controller.send(data);
  }

  static async send(data: any): Promise<any> {
    const client: Client = await Controller.getClient();
    async function receiveData() {
      return new Promise((resolve, _reject) => {
        messageChannel.port1.onmessage = (messageEvent) => {
          if (messageEvent.data) {
            resolve(messageEvent.data);
          }
        };

        client.postMessage(data, [messageChannel.port2]);
      });
    }
    var messageChannel = new MessageChannel();
    var receivedData = await receiveData();
    messageChannel.port1.onmessage = null;
    messageChannel.port1.close();
    messageChannel.port2.close();

    return receivedData;
  }

  static async handleMessage(event: ExtendableMessageEvent) {
    if (
      event.isTrusted &&
      event.data === "initController" &&
      event.source instanceof WindowClient
    ) {
      Controller.client = event.source;
      Controller.clientResolve(Controller.client);
    }
  }

  static startListener() {
    SW.addEventListener("message", Controller.handleMessage);
  }
}

export class Runner {
  private static handler = {
    get(_: any, prop: string | symbol) {
      if (typeof prop === "string") {
        return (...args: any[]) => Controller.run(prop, ...args);
      }
      return undefined;
    },
  };

  static run = new Proxy({}, Runner.handler);
}
