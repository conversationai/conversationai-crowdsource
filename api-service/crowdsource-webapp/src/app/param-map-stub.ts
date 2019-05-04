import { ParamMap } from '@angular/router';

// TODO: maybe replace this with just using URLSearchParams in tests.
// A stub class that implements ParamMap.
export class ParamMapStub implements ParamMap {
  constructor(private params: {[key: string]: string}) {}

  has(name: string): boolean {
    return this.params.hasOwnProperty(name);
  }

  get(name: string): string | null {
    return this.params[name];
  }

  getAll(name: string): string[] {
    return [this.params[name]];
  }

  get keys(): string[] {
    const objKeys: string[] = [];
    for (const key of Object.keys(this.params)) {
      objKeys.push(key);
    }
    return objKeys;
  }
}
