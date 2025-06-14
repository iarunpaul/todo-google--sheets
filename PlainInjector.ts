class UserService {
  sayHello(name: string): void {
    console.log(`Hello, ${name}!`);
  }
}
class Component {
  userService: UserService;

  constructor(userService?: UserService) {
    this.userService = userService? userService : new UserService();
  }

  greetUser(name: string): void {
    this.userService.sayHello(name);
  }
}
// Example usage
const component = new Component();
component.greetUser('Alice'); // Returns "Hello, Alice!"

// Angular DI Simulation
class AngularInjector {
  private services = new Map();
  constructor(providers: any[]) {
    providers.forEach(provider => {
      this.services.set(provider, new provider());
    })
  }


  get(service: any): any {
    if (!this.services.has(service)) {
      throw new Error(`Service ${service.name} not found`);
    }
    return this.services.get(service);
  }
}

// Example of Angular DI
const injector = new AngularInjector([UserService]);
const componentWithDI = new Component(injector.get(UserService));
componentWithDI.greetUser('Bob'); // Returns "Hello, Bob!"
