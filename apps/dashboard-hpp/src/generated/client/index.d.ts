
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model MasterSheet
 * 
 */
export type MasterSheet = $Result.DefaultSelection<Prisma.$MasterSheetPayload>
/**
 * Model Budget
 * 
 */
export type Budget = $Result.DefaultSelection<Prisma.$BudgetPayload>
/**
 * Model LokasiHPP
 * 
 */
export type LokasiHPP = $Result.DefaultSelection<Prisma.$LokasiHPPPayload>
/**
 * Model AktivitasHPP
 * 
 */
export type AktivitasHPP = $Result.DefaultSelection<Prisma.$AktivitasHPPPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more MasterSheets
 * const masterSheets = await prisma.masterSheet.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more MasterSheets
   * const masterSheets = await prisma.masterSheet.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.masterSheet`: Exposes CRUD operations for the **MasterSheet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MasterSheets
    * const masterSheets = await prisma.masterSheet.findMany()
    * ```
    */
  get masterSheet(): Prisma.MasterSheetDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.budget`: Exposes CRUD operations for the **Budget** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Budgets
    * const budgets = await prisma.budget.findMany()
    * ```
    */
  get budget(): Prisma.BudgetDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.lokasiHPP`: Exposes CRUD operations for the **LokasiHPP** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LokasiHPPS
    * const lokasiHPPS = await prisma.lokasiHPP.findMany()
    * ```
    */
  get lokasiHPP(): Prisma.LokasiHPPDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.aktivitasHPP`: Exposes CRUD operations for the **AktivitasHPP** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AktivitasHPPS
    * const aktivitasHPPS = await prisma.aktivitasHPP.findMany()
    * ```
    */
  get aktivitasHPP(): Prisma.AktivitasHPPDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    MasterSheet: 'MasterSheet',
    Budget: 'Budget',
    LokasiHPP: 'LokasiHPP',
    AktivitasHPP: 'AktivitasHPP'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "masterSheet" | "budget" | "lokasiHPP" | "aktivitasHPP"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      MasterSheet: {
        payload: Prisma.$MasterSheetPayload<ExtArgs>
        fields: Prisma.MasterSheetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MasterSheetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterSheetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MasterSheetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterSheetPayload>
          }
          findFirst: {
            args: Prisma.MasterSheetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterSheetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MasterSheetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterSheetPayload>
          }
          findMany: {
            args: Prisma.MasterSheetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterSheetPayload>[]
          }
          create: {
            args: Prisma.MasterSheetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterSheetPayload>
          }
          createMany: {
            args: Prisma.MasterSheetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MasterSheetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterSheetPayload>[]
          }
          delete: {
            args: Prisma.MasterSheetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterSheetPayload>
          }
          update: {
            args: Prisma.MasterSheetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterSheetPayload>
          }
          deleteMany: {
            args: Prisma.MasterSheetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MasterSheetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MasterSheetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterSheetPayload>[]
          }
          upsert: {
            args: Prisma.MasterSheetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MasterSheetPayload>
          }
          aggregate: {
            args: Prisma.MasterSheetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMasterSheet>
          }
          groupBy: {
            args: Prisma.MasterSheetGroupByArgs<ExtArgs>
            result: $Utils.Optional<MasterSheetGroupByOutputType>[]
          }
          count: {
            args: Prisma.MasterSheetCountArgs<ExtArgs>
            result: $Utils.Optional<MasterSheetCountAggregateOutputType> | number
          }
        }
      }
      Budget: {
        payload: Prisma.$BudgetPayload<ExtArgs>
        fields: Prisma.BudgetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BudgetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BudgetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BudgetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BudgetPayload>
          }
          findFirst: {
            args: Prisma.BudgetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BudgetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BudgetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BudgetPayload>
          }
          findMany: {
            args: Prisma.BudgetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BudgetPayload>[]
          }
          create: {
            args: Prisma.BudgetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BudgetPayload>
          }
          createMany: {
            args: Prisma.BudgetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BudgetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BudgetPayload>[]
          }
          delete: {
            args: Prisma.BudgetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BudgetPayload>
          }
          update: {
            args: Prisma.BudgetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BudgetPayload>
          }
          deleteMany: {
            args: Prisma.BudgetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BudgetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BudgetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BudgetPayload>[]
          }
          upsert: {
            args: Prisma.BudgetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BudgetPayload>
          }
          aggregate: {
            args: Prisma.BudgetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBudget>
          }
          groupBy: {
            args: Prisma.BudgetGroupByArgs<ExtArgs>
            result: $Utils.Optional<BudgetGroupByOutputType>[]
          }
          count: {
            args: Prisma.BudgetCountArgs<ExtArgs>
            result: $Utils.Optional<BudgetCountAggregateOutputType> | number
          }
        }
      }
      LokasiHPP: {
        payload: Prisma.$LokasiHPPPayload<ExtArgs>
        fields: Prisma.LokasiHPPFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LokasiHPPFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LokasiHPPPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LokasiHPPFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LokasiHPPPayload>
          }
          findFirst: {
            args: Prisma.LokasiHPPFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LokasiHPPPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LokasiHPPFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LokasiHPPPayload>
          }
          findMany: {
            args: Prisma.LokasiHPPFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LokasiHPPPayload>[]
          }
          create: {
            args: Prisma.LokasiHPPCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LokasiHPPPayload>
          }
          createMany: {
            args: Prisma.LokasiHPPCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LokasiHPPCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LokasiHPPPayload>[]
          }
          delete: {
            args: Prisma.LokasiHPPDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LokasiHPPPayload>
          }
          update: {
            args: Prisma.LokasiHPPUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LokasiHPPPayload>
          }
          deleteMany: {
            args: Prisma.LokasiHPPDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LokasiHPPUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LokasiHPPUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LokasiHPPPayload>[]
          }
          upsert: {
            args: Prisma.LokasiHPPUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LokasiHPPPayload>
          }
          aggregate: {
            args: Prisma.LokasiHPPAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLokasiHPP>
          }
          groupBy: {
            args: Prisma.LokasiHPPGroupByArgs<ExtArgs>
            result: $Utils.Optional<LokasiHPPGroupByOutputType>[]
          }
          count: {
            args: Prisma.LokasiHPPCountArgs<ExtArgs>
            result: $Utils.Optional<LokasiHPPCountAggregateOutputType> | number
          }
        }
      }
      AktivitasHPP: {
        payload: Prisma.$AktivitasHPPPayload<ExtArgs>
        fields: Prisma.AktivitasHPPFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AktivitasHPPFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AktivitasHPPPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AktivitasHPPFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AktivitasHPPPayload>
          }
          findFirst: {
            args: Prisma.AktivitasHPPFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AktivitasHPPPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AktivitasHPPFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AktivitasHPPPayload>
          }
          findMany: {
            args: Prisma.AktivitasHPPFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AktivitasHPPPayload>[]
          }
          create: {
            args: Prisma.AktivitasHPPCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AktivitasHPPPayload>
          }
          createMany: {
            args: Prisma.AktivitasHPPCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AktivitasHPPCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AktivitasHPPPayload>[]
          }
          delete: {
            args: Prisma.AktivitasHPPDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AktivitasHPPPayload>
          }
          update: {
            args: Prisma.AktivitasHPPUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AktivitasHPPPayload>
          }
          deleteMany: {
            args: Prisma.AktivitasHPPDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AktivitasHPPUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AktivitasHPPUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AktivitasHPPPayload>[]
          }
          upsert: {
            args: Prisma.AktivitasHPPUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AktivitasHPPPayload>
          }
          aggregate: {
            args: Prisma.AktivitasHPPAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAktivitasHPP>
          }
          groupBy: {
            args: Prisma.AktivitasHPPGroupByArgs<ExtArgs>
            result: $Utils.Optional<AktivitasHPPGroupByOutputType>[]
          }
          count: {
            args: Prisma.AktivitasHPPCountArgs<ExtArgs>
            result: $Utils.Optional<AktivitasHPPCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    masterSheet?: MasterSheetOmit
    budget?: BudgetOmit
    lokasiHPP?: LokasiHPPOmit
    aktivitasHPP?: AktivitasHPPOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type MasterSheetCountOutputType
   */

  export type MasterSheetCountOutputType = {
    lokasiHppList: number
    aktivitasHppList: number
  }

  export type MasterSheetCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lokasiHppList?: boolean | MasterSheetCountOutputTypeCountLokasiHppListArgs
    aktivitasHppList?: boolean | MasterSheetCountOutputTypeCountAktivitasHppListArgs
  }

  // Custom InputTypes
  /**
   * MasterSheetCountOutputType without action
   */
  export type MasterSheetCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheetCountOutputType
     */
    select?: MasterSheetCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MasterSheetCountOutputType without action
   */
  export type MasterSheetCountOutputTypeCountLokasiHppListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LokasiHPPWhereInput
  }

  /**
   * MasterSheetCountOutputType without action
   */
  export type MasterSheetCountOutputTypeCountAktivitasHppListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AktivitasHPPWhereInput
  }


  /**
   * Count Type BudgetCountOutputType
   */

  export type BudgetCountOutputType = {
    lokasiHppList: number
  }

  export type BudgetCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lokasiHppList?: boolean | BudgetCountOutputTypeCountLokasiHppListArgs
  }

  // Custom InputTypes
  /**
   * BudgetCountOutputType without action
   */
  export type BudgetCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BudgetCountOutputType
     */
    select?: BudgetCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BudgetCountOutputType without action
   */
  export type BudgetCountOutputTypeCountLokasiHppListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LokasiHPPWhereInput
  }


  /**
   * Models
   */

  /**
   * Model MasterSheet
   */

  export type AggregateMasterSheet = {
    _count: MasterSheetCountAggregateOutputType | null
    _min: MasterSheetMinAggregateOutputType | null
    _max: MasterSheetMaxAggregateOutputType | null
  }

  export type MasterSheetMinAggregateOutputType = {
    idMaster: string | null
    lokasi: string | null
    wilayah: string | null
    jenisBibit: string | null
    kelasBibit: string | null
    status: string | null
    tanggalRawat: Date | null
    tanggalTanam: Date | null
    tanggalForcingStandard: Date | null
    tanggalRenForcing: Date | null
    tanggalRealForcing: Date | null
    tanggalSelesaiPanen: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MasterSheetMaxAggregateOutputType = {
    idMaster: string | null
    lokasi: string | null
    wilayah: string | null
    jenisBibit: string | null
    kelasBibit: string | null
    status: string | null
    tanggalRawat: Date | null
    tanggalTanam: Date | null
    tanggalForcingStandard: Date | null
    tanggalRenForcing: Date | null
    tanggalRealForcing: Date | null
    tanggalSelesaiPanen: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MasterSheetCountAggregateOutputType = {
    idMaster: number
    lokasi: number
    wilayah: number
    jenisBibit: number
    kelasBibit: number
    status: number
    tanggalRawat: number
    tanggalTanam: number
    tanggalForcingStandard: number
    tanggalRenForcing: number
    tanggalRealForcing: number
    tanggalSelesaiPanen: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MasterSheetMinAggregateInputType = {
    idMaster?: true
    lokasi?: true
    wilayah?: true
    jenisBibit?: true
    kelasBibit?: true
    status?: true
    tanggalRawat?: true
    tanggalTanam?: true
    tanggalForcingStandard?: true
    tanggalRenForcing?: true
    tanggalRealForcing?: true
    tanggalSelesaiPanen?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MasterSheetMaxAggregateInputType = {
    idMaster?: true
    lokasi?: true
    wilayah?: true
    jenisBibit?: true
    kelasBibit?: true
    status?: true
    tanggalRawat?: true
    tanggalTanam?: true
    tanggalForcingStandard?: true
    tanggalRenForcing?: true
    tanggalRealForcing?: true
    tanggalSelesaiPanen?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MasterSheetCountAggregateInputType = {
    idMaster?: true
    lokasi?: true
    wilayah?: true
    jenisBibit?: true
    kelasBibit?: true
    status?: true
    tanggalRawat?: true
    tanggalTanam?: true
    tanggalForcingStandard?: true
    tanggalRenForcing?: true
    tanggalRealForcing?: true
    tanggalSelesaiPanen?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MasterSheetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MasterSheet to aggregate.
     */
    where?: MasterSheetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterSheets to fetch.
     */
    orderBy?: MasterSheetOrderByWithRelationInput | MasterSheetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MasterSheetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterSheets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterSheets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MasterSheets
    **/
    _count?: true | MasterSheetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MasterSheetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MasterSheetMaxAggregateInputType
  }

  export type GetMasterSheetAggregateType<T extends MasterSheetAggregateArgs> = {
        [P in keyof T & keyof AggregateMasterSheet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMasterSheet[P]>
      : GetScalarType<T[P], AggregateMasterSheet[P]>
  }




  export type MasterSheetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MasterSheetWhereInput
    orderBy?: MasterSheetOrderByWithAggregationInput | MasterSheetOrderByWithAggregationInput[]
    by: MasterSheetScalarFieldEnum[] | MasterSheetScalarFieldEnum
    having?: MasterSheetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MasterSheetCountAggregateInputType | true
    _min?: MasterSheetMinAggregateInputType
    _max?: MasterSheetMaxAggregateInputType
  }

  export type MasterSheetGroupByOutputType = {
    idMaster: string
    lokasi: string
    wilayah: string
    jenisBibit: string
    kelasBibit: string
    status: string
    tanggalRawat: Date
    tanggalTanam: Date | null
    tanggalForcingStandard: Date | null
    tanggalRenForcing: Date | null
    tanggalRealForcing: Date | null
    tanggalSelesaiPanen: Date | null
    createdAt: Date
    updatedAt: Date
    _count: MasterSheetCountAggregateOutputType | null
    _min: MasterSheetMinAggregateOutputType | null
    _max: MasterSheetMaxAggregateOutputType | null
  }

  type GetMasterSheetGroupByPayload<T extends MasterSheetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MasterSheetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MasterSheetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MasterSheetGroupByOutputType[P]>
            : GetScalarType<T[P], MasterSheetGroupByOutputType[P]>
        }
      >
    >


  export type MasterSheetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idMaster?: boolean
    lokasi?: boolean
    wilayah?: boolean
    jenisBibit?: boolean
    kelasBibit?: boolean
    status?: boolean
    tanggalRawat?: boolean
    tanggalTanam?: boolean
    tanggalForcingStandard?: boolean
    tanggalRenForcing?: boolean
    tanggalRealForcing?: boolean
    tanggalSelesaiPanen?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lokasiHppList?: boolean | MasterSheet$lokasiHppListArgs<ExtArgs>
    aktivitasHppList?: boolean | MasterSheet$aktivitasHppListArgs<ExtArgs>
    _count?: boolean | MasterSheetCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["masterSheet"]>

  export type MasterSheetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idMaster?: boolean
    lokasi?: boolean
    wilayah?: boolean
    jenisBibit?: boolean
    kelasBibit?: boolean
    status?: boolean
    tanggalRawat?: boolean
    tanggalTanam?: boolean
    tanggalForcingStandard?: boolean
    tanggalRenForcing?: boolean
    tanggalRealForcing?: boolean
    tanggalSelesaiPanen?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["masterSheet"]>

  export type MasterSheetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idMaster?: boolean
    lokasi?: boolean
    wilayah?: boolean
    jenisBibit?: boolean
    kelasBibit?: boolean
    status?: boolean
    tanggalRawat?: boolean
    tanggalTanam?: boolean
    tanggalForcingStandard?: boolean
    tanggalRenForcing?: boolean
    tanggalRealForcing?: boolean
    tanggalSelesaiPanen?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["masterSheet"]>

  export type MasterSheetSelectScalar = {
    idMaster?: boolean
    lokasi?: boolean
    wilayah?: boolean
    jenisBibit?: boolean
    kelasBibit?: boolean
    status?: boolean
    tanggalRawat?: boolean
    tanggalTanam?: boolean
    tanggalForcingStandard?: boolean
    tanggalRenForcing?: boolean
    tanggalRealForcing?: boolean
    tanggalSelesaiPanen?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MasterSheetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idMaster" | "lokasi" | "wilayah" | "jenisBibit" | "kelasBibit" | "status" | "tanggalRawat" | "tanggalTanam" | "tanggalForcingStandard" | "tanggalRenForcing" | "tanggalRealForcing" | "tanggalSelesaiPanen" | "createdAt" | "updatedAt", ExtArgs["result"]["masterSheet"]>
  export type MasterSheetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lokasiHppList?: boolean | MasterSheet$lokasiHppListArgs<ExtArgs>
    aktivitasHppList?: boolean | MasterSheet$aktivitasHppListArgs<ExtArgs>
    _count?: boolean | MasterSheetCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MasterSheetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type MasterSheetIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $MasterSheetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MasterSheet"
    objects: {
      lokasiHppList: Prisma.$LokasiHPPPayload<ExtArgs>[]
      aktivitasHppList: Prisma.$AktivitasHPPPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      idMaster: string
      lokasi: string
      wilayah: string
      jenisBibit: string
      kelasBibit: string
      status: string
      tanggalRawat: Date
      tanggalTanam: Date | null
      tanggalForcingStandard: Date | null
      tanggalRenForcing: Date | null
      tanggalRealForcing: Date | null
      tanggalSelesaiPanen: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["masterSheet"]>
    composites: {}
  }

  type MasterSheetGetPayload<S extends boolean | null | undefined | MasterSheetDefaultArgs> = $Result.GetResult<Prisma.$MasterSheetPayload, S>

  type MasterSheetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MasterSheetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MasterSheetCountAggregateInputType | true
    }

  export interface MasterSheetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MasterSheet'], meta: { name: 'MasterSheet' } }
    /**
     * Find zero or one MasterSheet that matches the filter.
     * @param {MasterSheetFindUniqueArgs} args - Arguments to find a MasterSheet
     * @example
     * // Get one MasterSheet
     * const masterSheet = await prisma.masterSheet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MasterSheetFindUniqueArgs>(args: SelectSubset<T, MasterSheetFindUniqueArgs<ExtArgs>>): Prisma__MasterSheetClient<$Result.GetResult<Prisma.$MasterSheetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MasterSheet that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MasterSheetFindUniqueOrThrowArgs} args - Arguments to find a MasterSheet
     * @example
     * // Get one MasterSheet
     * const masterSheet = await prisma.masterSheet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MasterSheetFindUniqueOrThrowArgs>(args: SelectSubset<T, MasterSheetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MasterSheetClient<$Result.GetResult<Prisma.$MasterSheetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MasterSheet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterSheetFindFirstArgs} args - Arguments to find a MasterSheet
     * @example
     * // Get one MasterSheet
     * const masterSheet = await prisma.masterSheet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MasterSheetFindFirstArgs>(args?: SelectSubset<T, MasterSheetFindFirstArgs<ExtArgs>>): Prisma__MasterSheetClient<$Result.GetResult<Prisma.$MasterSheetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MasterSheet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterSheetFindFirstOrThrowArgs} args - Arguments to find a MasterSheet
     * @example
     * // Get one MasterSheet
     * const masterSheet = await prisma.masterSheet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MasterSheetFindFirstOrThrowArgs>(args?: SelectSubset<T, MasterSheetFindFirstOrThrowArgs<ExtArgs>>): Prisma__MasterSheetClient<$Result.GetResult<Prisma.$MasterSheetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MasterSheets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterSheetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MasterSheets
     * const masterSheets = await prisma.masterSheet.findMany()
     * 
     * // Get first 10 MasterSheets
     * const masterSheets = await prisma.masterSheet.findMany({ take: 10 })
     * 
     * // Only select the `idMaster`
     * const masterSheetWithIdMasterOnly = await prisma.masterSheet.findMany({ select: { idMaster: true } })
     * 
     */
    findMany<T extends MasterSheetFindManyArgs>(args?: SelectSubset<T, MasterSheetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MasterSheetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MasterSheet.
     * @param {MasterSheetCreateArgs} args - Arguments to create a MasterSheet.
     * @example
     * // Create one MasterSheet
     * const MasterSheet = await prisma.masterSheet.create({
     *   data: {
     *     // ... data to create a MasterSheet
     *   }
     * })
     * 
     */
    create<T extends MasterSheetCreateArgs>(args: SelectSubset<T, MasterSheetCreateArgs<ExtArgs>>): Prisma__MasterSheetClient<$Result.GetResult<Prisma.$MasterSheetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MasterSheets.
     * @param {MasterSheetCreateManyArgs} args - Arguments to create many MasterSheets.
     * @example
     * // Create many MasterSheets
     * const masterSheet = await prisma.masterSheet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MasterSheetCreateManyArgs>(args?: SelectSubset<T, MasterSheetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MasterSheets and returns the data saved in the database.
     * @param {MasterSheetCreateManyAndReturnArgs} args - Arguments to create many MasterSheets.
     * @example
     * // Create many MasterSheets
     * const masterSheet = await prisma.masterSheet.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MasterSheets and only return the `idMaster`
     * const masterSheetWithIdMasterOnly = await prisma.masterSheet.createManyAndReturn({
     *   select: { idMaster: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MasterSheetCreateManyAndReturnArgs>(args?: SelectSubset<T, MasterSheetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MasterSheetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MasterSheet.
     * @param {MasterSheetDeleteArgs} args - Arguments to delete one MasterSheet.
     * @example
     * // Delete one MasterSheet
     * const MasterSheet = await prisma.masterSheet.delete({
     *   where: {
     *     // ... filter to delete one MasterSheet
     *   }
     * })
     * 
     */
    delete<T extends MasterSheetDeleteArgs>(args: SelectSubset<T, MasterSheetDeleteArgs<ExtArgs>>): Prisma__MasterSheetClient<$Result.GetResult<Prisma.$MasterSheetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MasterSheet.
     * @param {MasterSheetUpdateArgs} args - Arguments to update one MasterSheet.
     * @example
     * // Update one MasterSheet
     * const masterSheet = await prisma.masterSheet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MasterSheetUpdateArgs>(args: SelectSubset<T, MasterSheetUpdateArgs<ExtArgs>>): Prisma__MasterSheetClient<$Result.GetResult<Prisma.$MasterSheetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MasterSheets.
     * @param {MasterSheetDeleteManyArgs} args - Arguments to filter MasterSheets to delete.
     * @example
     * // Delete a few MasterSheets
     * const { count } = await prisma.masterSheet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MasterSheetDeleteManyArgs>(args?: SelectSubset<T, MasterSheetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MasterSheets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterSheetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MasterSheets
     * const masterSheet = await prisma.masterSheet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MasterSheetUpdateManyArgs>(args: SelectSubset<T, MasterSheetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MasterSheets and returns the data updated in the database.
     * @param {MasterSheetUpdateManyAndReturnArgs} args - Arguments to update many MasterSheets.
     * @example
     * // Update many MasterSheets
     * const masterSheet = await prisma.masterSheet.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MasterSheets and only return the `idMaster`
     * const masterSheetWithIdMasterOnly = await prisma.masterSheet.updateManyAndReturn({
     *   select: { idMaster: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MasterSheetUpdateManyAndReturnArgs>(args: SelectSubset<T, MasterSheetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MasterSheetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MasterSheet.
     * @param {MasterSheetUpsertArgs} args - Arguments to update or create a MasterSheet.
     * @example
     * // Update or create a MasterSheet
     * const masterSheet = await prisma.masterSheet.upsert({
     *   create: {
     *     // ... data to create a MasterSheet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MasterSheet we want to update
     *   }
     * })
     */
    upsert<T extends MasterSheetUpsertArgs>(args: SelectSubset<T, MasterSheetUpsertArgs<ExtArgs>>): Prisma__MasterSheetClient<$Result.GetResult<Prisma.$MasterSheetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MasterSheets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterSheetCountArgs} args - Arguments to filter MasterSheets to count.
     * @example
     * // Count the number of MasterSheets
     * const count = await prisma.masterSheet.count({
     *   where: {
     *     // ... the filter for the MasterSheets we want to count
     *   }
     * })
    **/
    count<T extends MasterSheetCountArgs>(
      args?: Subset<T, MasterSheetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MasterSheetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MasterSheet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterSheetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MasterSheetAggregateArgs>(args: Subset<T, MasterSheetAggregateArgs>): Prisma.PrismaPromise<GetMasterSheetAggregateType<T>>

    /**
     * Group by MasterSheet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MasterSheetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MasterSheetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MasterSheetGroupByArgs['orderBy'] }
        : { orderBy?: MasterSheetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MasterSheetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMasterSheetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MasterSheet model
   */
  readonly fields: MasterSheetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MasterSheet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MasterSheetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    lokasiHppList<T extends MasterSheet$lokasiHppListArgs<ExtArgs> = {}>(args?: Subset<T, MasterSheet$lokasiHppListArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LokasiHPPPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    aktivitasHppList<T extends MasterSheet$aktivitasHppListArgs<ExtArgs> = {}>(args?: Subset<T, MasterSheet$aktivitasHppListArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AktivitasHPPPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MasterSheet model
   */
  interface MasterSheetFieldRefs {
    readonly idMaster: FieldRef<"MasterSheet", 'String'>
    readonly lokasi: FieldRef<"MasterSheet", 'String'>
    readonly wilayah: FieldRef<"MasterSheet", 'String'>
    readonly jenisBibit: FieldRef<"MasterSheet", 'String'>
    readonly kelasBibit: FieldRef<"MasterSheet", 'String'>
    readonly status: FieldRef<"MasterSheet", 'String'>
    readonly tanggalRawat: FieldRef<"MasterSheet", 'DateTime'>
    readonly tanggalTanam: FieldRef<"MasterSheet", 'DateTime'>
    readonly tanggalForcingStandard: FieldRef<"MasterSheet", 'DateTime'>
    readonly tanggalRenForcing: FieldRef<"MasterSheet", 'DateTime'>
    readonly tanggalRealForcing: FieldRef<"MasterSheet", 'DateTime'>
    readonly tanggalSelesaiPanen: FieldRef<"MasterSheet", 'DateTime'>
    readonly createdAt: FieldRef<"MasterSheet", 'DateTime'>
    readonly updatedAt: FieldRef<"MasterSheet", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MasterSheet findUnique
   */
  export type MasterSheetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterSheetInclude<ExtArgs> | null
    /**
     * Filter, which MasterSheet to fetch.
     */
    where: MasterSheetWhereUniqueInput
  }

  /**
   * MasterSheet findUniqueOrThrow
   */
  export type MasterSheetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterSheetInclude<ExtArgs> | null
    /**
     * Filter, which MasterSheet to fetch.
     */
    where: MasterSheetWhereUniqueInput
  }

  /**
   * MasterSheet findFirst
   */
  export type MasterSheetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterSheetInclude<ExtArgs> | null
    /**
     * Filter, which MasterSheet to fetch.
     */
    where?: MasterSheetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterSheets to fetch.
     */
    orderBy?: MasterSheetOrderByWithRelationInput | MasterSheetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MasterSheets.
     */
    cursor?: MasterSheetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterSheets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterSheets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MasterSheets.
     */
    distinct?: MasterSheetScalarFieldEnum | MasterSheetScalarFieldEnum[]
  }

  /**
   * MasterSheet findFirstOrThrow
   */
  export type MasterSheetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterSheetInclude<ExtArgs> | null
    /**
     * Filter, which MasterSheet to fetch.
     */
    where?: MasterSheetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterSheets to fetch.
     */
    orderBy?: MasterSheetOrderByWithRelationInput | MasterSheetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MasterSheets.
     */
    cursor?: MasterSheetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterSheets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterSheets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MasterSheets.
     */
    distinct?: MasterSheetScalarFieldEnum | MasterSheetScalarFieldEnum[]
  }

  /**
   * MasterSheet findMany
   */
  export type MasterSheetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterSheetInclude<ExtArgs> | null
    /**
     * Filter, which MasterSheets to fetch.
     */
    where?: MasterSheetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MasterSheets to fetch.
     */
    orderBy?: MasterSheetOrderByWithRelationInput | MasterSheetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MasterSheets.
     */
    cursor?: MasterSheetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MasterSheets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MasterSheets.
     */
    skip?: number
    distinct?: MasterSheetScalarFieldEnum | MasterSheetScalarFieldEnum[]
  }

  /**
   * MasterSheet create
   */
  export type MasterSheetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterSheetInclude<ExtArgs> | null
    /**
     * The data needed to create a MasterSheet.
     */
    data: XOR<MasterSheetCreateInput, MasterSheetUncheckedCreateInput>
  }

  /**
   * MasterSheet createMany
   */
  export type MasterSheetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MasterSheets.
     */
    data: MasterSheetCreateManyInput | MasterSheetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MasterSheet createManyAndReturn
   */
  export type MasterSheetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * The data used to create many MasterSheets.
     */
    data: MasterSheetCreateManyInput | MasterSheetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MasterSheet update
   */
  export type MasterSheetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterSheetInclude<ExtArgs> | null
    /**
     * The data needed to update a MasterSheet.
     */
    data: XOR<MasterSheetUpdateInput, MasterSheetUncheckedUpdateInput>
    /**
     * Choose, which MasterSheet to update.
     */
    where: MasterSheetWhereUniqueInput
  }

  /**
   * MasterSheet updateMany
   */
  export type MasterSheetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MasterSheets.
     */
    data: XOR<MasterSheetUpdateManyMutationInput, MasterSheetUncheckedUpdateManyInput>
    /**
     * Filter which MasterSheets to update
     */
    where?: MasterSheetWhereInput
    /**
     * Limit how many MasterSheets to update.
     */
    limit?: number
  }

  /**
   * MasterSheet updateManyAndReturn
   */
  export type MasterSheetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * The data used to update MasterSheets.
     */
    data: XOR<MasterSheetUpdateManyMutationInput, MasterSheetUncheckedUpdateManyInput>
    /**
     * Filter which MasterSheets to update
     */
    where?: MasterSheetWhereInput
    /**
     * Limit how many MasterSheets to update.
     */
    limit?: number
  }

  /**
   * MasterSheet upsert
   */
  export type MasterSheetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterSheetInclude<ExtArgs> | null
    /**
     * The filter to search for the MasterSheet to update in case it exists.
     */
    where: MasterSheetWhereUniqueInput
    /**
     * In case the MasterSheet found by the `where` argument doesn't exist, create a new MasterSheet with this data.
     */
    create: XOR<MasterSheetCreateInput, MasterSheetUncheckedCreateInput>
    /**
     * In case the MasterSheet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MasterSheetUpdateInput, MasterSheetUncheckedUpdateInput>
  }

  /**
   * MasterSheet delete
   */
  export type MasterSheetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterSheetInclude<ExtArgs> | null
    /**
     * Filter which MasterSheet to delete.
     */
    where: MasterSheetWhereUniqueInput
  }

  /**
   * MasterSheet deleteMany
   */
  export type MasterSheetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MasterSheets to delete
     */
    where?: MasterSheetWhereInput
    /**
     * Limit how many MasterSheets to delete.
     */
    limit?: number
  }

  /**
   * MasterSheet.lokasiHppList
   */
  export type MasterSheet$lokasiHppListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPInclude<ExtArgs> | null
    where?: LokasiHPPWhereInput
    orderBy?: LokasiHPPOrderByWithRelationInput | LokasiHPPOrderByWithRelationInput[]
    cursor?: LokasiHPPWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LokasiHPPScalarFieldEnum | LokasiHPPScalarFieldEnum[]
  }

  /**
   * MasterSheet.aktivitasHppList
   */
  export type MasterSheet$aktivitasHppListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AktivitasHPP
     */
    select?: AktivitasHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AktivitasHPP
     */
    omit?: AktivitasHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AktivitasHPPInclude<ExtArgs> | null
    where?: AktivitasHPPWhereInput
    orderBy?: AktivitasHPPOrderByWithRelationInput | AktivitasHPPOrderByWithRelationInput[]
    cursor?: AktivitasHPPWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AktivitasHPPScalarFieldEnum | AktivitasHPPScalarFieldEnum[]
  }

  /**
   * MasterSheet without action
   */
  export type MasterSheetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterSheetInclude<ExtArgs> | null
  }


  /**
   * Model Budget
   */

  export type AggregateBudget = {
    _count: BudgetCountAggregateOutputType | null
    _avg: BudgetAvgAggregateOutputType | null
    _sum: BudgetSumAggregateOutputType | null
    _min: BudgetMinAggregateOutputType | null
    _max: BudgetMaxAggregateOutputType | null
  }

  export type BudgetAvgAggregateOutputType = {
    periode: number | null
    budget: Decimal | null
  }

  export type BudgetSumAggregateOutputType = {
    periode: number | null
    budget: Decimal | null
  }

  export type BudgetMinAggregateOutputType = {
    idBudget: string | null
    group: string | null
    status: string | null
    periode: number | null
    budget: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BudgetMaxAggregateOutputType = {
    idBudget: string | null
    group: string | null
    status: string | null
    periode: number | null
    budget: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BudgetCountAggregateOutputType = {
    idBudget: number
    group: number
    status: number
    periode: number
    budget: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BudgetAvgAggregateInputType = {
    periode?: true
    budget?: true
  }

  export type BudgetSumAggregateInputType = {
    periode?: true
    budget?: true
  }

  export type BudgetMinAggregateInputType = {
    idBudget?: true
    group?: true
    status?: true
    periode?: true
    budget?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BudgetMaxAggregateInputType = {
    idBudget?: true
    group?: true
    status?: true
    periode?: true
    budget?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BudgetCountAggregateInputType = {
    idBudget?: true
    group?: true
    status?: true
    periode?: true
    budget?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BudgetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Budget to aggregate.
     */
    where?: BudgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Budgets to fetch.
     */
    orderBy?: BudgetOrderByWithRelationInput | BudgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BudgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Budgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Budgets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Budgets
    **/
    _count?: true | BudgetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BudgetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BudgetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BudgetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BudgetMaxAggregateInputType
  }

  export type GetBudgetAggregateType<T extends BudgetAggregateArgs> = {
        [P in keyof T & keyof AggregateBudget]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBudget[P]>
      : GetScalarType<T[P], AggregateBudget[P]>
  }




  export type BudgetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BudgetWhereInput
    orderBy?: BudgetOrderByWithAggregationInput | BudgetOrderByWithAggregationInput[]
    by: BudgetScalarFieldEnum[] | BudgetScalarFieldEnum
    having?: BudgetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BudgetCountAggregateInputType | true
    _avg?: BudgetAvgAggregateInputType
    _sum?: BudgetSumAggregateInputType
    _min?: BudgetMinAggregateInputType
    _max?: BudgetMaxAggregateInputType
  }

  export type BudgetGroupByOutputType = {
    idBudget: string
    group: string
    status: string
    periode: number
    budget: Decimal
    createdAt: Date
    updatedAt: Date
    _count: BudgetCountAggregateOutputType | null
    _avg: BudgetAvgAggregateOutputType | null
    _sum: BudgetSumAggregateOutputType | null
    _min: BudgetMinAggregateOutputType | null
    _max: BudgetMaxAggregateOutputType | null
  }

  type GetBudgetGroupByPayload<T extends BudgetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BudgetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BudgetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BudgetGroupByOutputType[P]>
            : GetScalarType<T[P], BudgetGroupByOutputType[P]>
        }
      >
    >


  export type BudgetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idBudget?: boolean
    group?: boolean
    status?: boolean
    periode?: boolean
    budget?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lokasiHppList?: boolean | Budget$lokasiHppListArgs<ExtArgs>
    _count?: boolean | BudgetCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["budget"]>

  export type BudgetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idBudget?: boolean
    group?: boolean
    status?: boolean
    periode?: boolean
    budget?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["budget"]>

  export type BudgetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idBudget?: boolean
    group?: boolean
    status?: boolean
    periode?: boolean
    budget?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["budget"]>

  export type BudgetSelectScalar = {
    idBudget?: boolean
    group?: boolean
    status?: boolean
    periode?: boolean
    budget?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BudgetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idBudget" | "group" | "status" | "periode" | "budget" | "createdAt" | "updatedAt", ExtArgs["result"]["budget"]>
  export type BudgetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lokasiHppList?: boolean | Budget$lokasiHppListArgs<ExtArgs>
    _count?: boolean | BudgetCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BudgetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type BudgetIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $BudgetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Budget"
    objects: {
      lokasiHppList: Prisma.$LokasiHPPPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      idBudget: string
      group: string
      status: string
      periode: number
      budget: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["budget"]>
    composites: {}
  }

  type BudgetGetPayload<S extends boolean | null | undefined | BudgetDefaultArgs> = $Result.GetResult<Prisma.$BudgetPayload, S>

  type BudgetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BudgetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BudgetCountAggregateInputType | true
    }

  export interface BudgetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Budget'], meta: { name: 'Budget' } }
    /**
     * Find zero or one Budget that matches the filter.
     * @param {BudgetFindUniqueArgs} args - Arguments to find a Budget
     * @example
     * // Get one Budget
     * const budget = await prisma.budget.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BudgetFindUniqueArgs>(args: SelectSubset<T, BudgetFindUniqueArgs<ExtArgs>>): Prisma__BudgetClient<$Result.GetResult<Prisma.$BudgetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Budget that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BudgetFindUniqueOrThrowArgs} args - Arguments to find a Budget
     * @example
     * // Get one Budget
     * const budget = await prisma.budget.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BudgetFindUniqueOrThrowArgs>(args: SelectSubset<T, BudgetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BudgetClient<$Result.GetResult<Prisma.$BudgetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Budget that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BudgetFindFirstArgs} args - Arguments to find a Budget
     * @example
     * // Get one Budget
     * const budget = await prisma.budget.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BudgetFindFirstArgs>(args?: SelectSubset<T, BudgetFindFirstArgs<ExtArgs>>): Prisma__BudgetClient<$Result.GetResult<Prisma.$BudgetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Budget that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BudgetFindFirstOrThrowArgs} args - Arguments to find a Budget
     * @example
     * // Get one Budget
     * const budget = await prisma.budget.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BudgetFindFirstOrThrowArgs>(args?: SelectSubset<T, BudgetFindFirstOrThrowArgs<ExtArgs>>): Prisma__BudgetClient<$Result.GetResult<Prisma.$BudgetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Budgets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BudgetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Budgets
     * const budgets = await prisma.budget.findMany()
     * 
     * // Get first 10 Budgets
     * const budgets = await prisma.budget.findMany({ take: 10 })
     * 
     * // Only select the `idBudget`
     * const budgetWithIdBudgetOnly = await prisma.budget.findMany({ select: { idBudget: true } })
     * 
     */
    findMany<T extends BudgetFindManyArgs>(args?: SelectSubset<T, BudgetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BudgetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Budget.
     * @param {BudgetCreateArgs} args - Arguments to create a Budget.
     * @example
     * // Create one Budget
     * const Budget = await prisma.budget.create({
     *   data: {
     *     // ... data to create a Budget
     *   }
     * })
     * 
     */
    create<T extends BudgetCreateArgs>(args: SelectSubset<T, BudgetCreateArgs<ExtArgs>>): Prisma__BudgetClient<$Result.GetResult<Prisma.$BudgetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Budgets.
     * @param {BudgetCreateManyArgs} args - Arguments to create many Budgets.
     * @example
     * // Create many Budgets
     * const budget = await prisma.budget.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BudgetCreateManyArgs>(args?: SelectSubset<T, BudgetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Budgets and returns the data saved in the database.
     * @param {BudgetCreateManyAndReturnArgs} args - Arguments to create many Budgets.
     * @example
     * // Create many Budgets
     * const budget = await prisma.budget.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Budgets and only return the `idBudget`
     * const budgetWithIdBudgetOnly = await prisma.budget.createManyAndReturn({
     *   select: { idBudget: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BudgetCreateManyAndReturnArgs>(args?: SelectSubset<T, BudgetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BudgetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Budget.
     * @param {BudgetDeleteArgs} args - Arguments to delete one Budget.
     * @example
     * // Delete one Budget
     * const Budget = await prisma.budget.delete({
     *   where: {
     *     // ... filter to delete one Budget
     *   }
     * })
     * 
     */
    delete<T extends BudgetDeleteArgs>(args: SelectSubset<T, BudgetDeleteArgs<ExtArgs>>): Prisma__BudgetClient<$Result.GetResult<Prisma.$BudgetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Budget.
     * @param {BudgetUpdateArgs} args - Arguments to update one Budget.
     * @example
     * // Update one Budget
     * const budget = await prisma.budget.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BudgetUpdateArgs>(args: SelectSubset<T, BudgetUpdateArgs<ExtArgs>>): Prisma__BudgetClient<$Result.GetResult<Prisma.$BudgetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Budgets.
     * @param {BudgetDeleteManyArgs} args - Arguments to filter Budgets to delete.
     * @example
     * // Delete a few Budgets
     * const { count } = await prisma.budget.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BudgetDeleteManyArgs>(args?: SelectSubset<T, BudgetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Budgets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BudgetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Budgets
     * const budget = await prisma.budget.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BudgetUpdateManyArgs>(args: SelectSubset<T, BudgetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Budgets and returns the data updated in the database.
     * @param {BudgetUpdateManyAndReturnArgs} args - Arguments to update many Budgets.
     * @example
     * // Update many Budgets
     * const budget = await prisma.budget.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Budgets and only return the `idBudget`
     * const budgetWithIdBudgetOnly = await prisma.budget.updateManyAndReturn({
     *   select: { idBudget: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BudgetUpdateManyAndReturnArgs>(args: SelectSubset<T, BudgetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BudgetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Budget.
     * @param {BudgetUpsertArgs} args - Arguments to update or create a Budget.
     * @example
     * // Update or create a Budget
     * const budget = await prisma.budget.upsert({
     *   create: {
     *     // ... data to create a Budget
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Budget we want to update
     *   }
     * })
     */
    upsert<T extends BudgetUpsertArgs>(args: SelectSubset<T, BudgetUpsertArgs<ExtArgs>>): Prisma__BudgetClient<$Result.GetResult<Prisma.$BudgetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Budgets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BudgetCountArgs} args - Arguments to filter Budgets to count.
     * @example
     * // Count the number of Budgets
     * const count = await prisma.budget.count({
     *   where: {
     *     // ... the filter for the Budgets we want to count
     *   }
     * })
    **/
    count<T extends BudgetCountArgs>(
      args?: Subset<T, BudgetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BudgetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Budget.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BudgetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BudgetAggregateArgs>(args: Subset<T, BudgetAggregateArgs>): Prisma.PrismaPromise<GetBudgetAggregateType<T>>

    /**
     * Group by Budget.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BudgetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BudgetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BudgetGroupByArgs['orderBy'] }
        : { orderBy?: BudgetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BudgetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBudgetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Budget model
   */
  readonly fields: BudgetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Budget.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BudgetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    lokasiHppList<T extends Budget$lokasiHppListArgs<ExtArgs> = {}>(args?: Subset<T, Budget$lokasiHppListArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LokasiHPPPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Budget model
   */
  interface BudgetFieldRefs {
    readonly idBudget: FieldRef<"Budget", 'String'>
    readonly group: FieldRef<"Budget", 'String'>
    readonly status: FieldRef<"Budget", 'String'>
    readonly periode: FieldRef<"Budget", 'Int'>
    readonly budget: FieldRef<"Budget", 'Decimal'>
    readonly createdAt: FieldRef<"Budget", 'DateTime'>
    readonly updatedAt: FieldRef<"Budget", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Budget findUnique
   */
  export type BudgetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Budget
     */
    select?: BudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Budget
     */
    omit?: BudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BudgetInclude<ExtArgs> | null
    /**
     * Filter, which Budget to fetch.
     */
    where: BudgetWhereUniqueInput
  }

  /**
   * Budget findUniqueOrThrow
   */
  export type BudgetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Budget
     */
    select?: BudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Budget
     */
    omit?: BudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BudgetInclude<ExtArgs> | null
    /**
     * Filter, which Budget to fetch.
     */
    where: BudgetWhereUniqueInput
  }

  /**
   * Budget findFirst
   */
  export type BudgetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Budget
     */
    select?: BudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Budget
     */
    omit?: BudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BudgetInclude<ExtArgs> | null
    /**
     * Filter, which Budget to fetch.
     */
    where?: BudgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Budgets to fetch.
     */
    orderBy?: BudgetOrderByWithRelationInput | BudgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Budgets.
     */
    cursor?: BudgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Budgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Budgets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Budgets.
     */
    distinct?: BudgetScalarFieldEnum | BudgetScalarFieldEnum[]
  }

  /**
   * Budget findFirstOrThrow
   */
  export type BudgetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Budget
     */
    select?: BudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Budget
     */
    omit?: BudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BudgetInclude<ExtArgs> | null
    /**
     * Filter, which Budget to fetch.
     */
    where?: BudgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Budgets to fetch.
     */
    orderBy?: BudgetOrderByWithRelationInput | BudgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Budgets.
     */
    cursor?: BudgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Budgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Budgets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Budgets.
     */
    distinct?: BudgetScalarFieldEnum | BudgetScalarFieldEnum[]
  }

  /**
   * Budget findMany
   */
  export type BudgetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Budget
     */
    select?: BudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Budget
     */
    omit?: BudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BudgetInclude<ExtArgs> | null
    /**
     * Filter, which Budgets to fetch.
     */
    where?: BudgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Budgets to fetch.
     */
    orderBy?: BudgetOrderByWithRelationInput | BudgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Budgets.
     */
    cursor?: BudgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Budgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Budgets.
     */
    skip?: number
    distinct?: BudgetScalarFieldEnum | BudgetScalarFieldEnum[]
  }

  /**
   * Budget create
   */
  export type BudgetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Budget
     */
    select?: BudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Budget
     */
    omit?: BudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BudgetInclude<ExtArgs> | null
    /**
     * The data needed to create a Budget.
     */
    data: XOR<BudgetCreateInput, BudgetUncheckedCreateInput>
  }

  /**
   * Budget createMany
   */
  export type BudgetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Budgets.
     */
    data: BudgetCreateManyInput | BudgetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Budget createManyAndReturn
   */
  export type BudgetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Budget
     */
    select?: BudgetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Budget
     */
    omit?: BudgetOmit<ExtArgs> | null
    /**
     * The data used to create many Budgets.
     */
    data: BudgetCreateManyInput | BudgetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Budget update
   */
  export type BudgetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Budget
     */
    select?: BudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Budget
     */
    omit?: BudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BudgetInclude<ExtArgs> | null
    /**
     * The data needed to update a Budget.
     */
    data: XOR<BudgetUpdateInput, BudgetUncheckedUpdateInput>
    /**
     * Choose, which Budget to update.
     */
    where: BudgetWhereUniqueInput
  }

  /**
   * Budget updateMany
   */
  export type BudgetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Budgets.
     */
    data: XOR<BudgetUpdateManyMutationInput, BudgetUncheckedUpdateManyInput>
    /**
     * Filter which Budgets to update
     */
    where?: BudgetWhereInput
    /**
     * Limit how many Budgets to update.
     */
    limit?: number
  }

  /**
   * Budget updateManyAndReturn
   */
  export type BudgetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Budget
     */
    select?: BudgetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Budget
     */
    omit?: BudgetOmit<ExtArgs> | null
    /**
     * The data used to update Budgets.
     */
    data: XOR<BudgetUpdateManyMutationInput, BudgetUncheckedUpdateManyInput>
    /**
     * Filter which Budgets to update
     */
    where?: BudgetWhereInput
    /**
     * Limit how many Budgets to update.
     */
    limit?: number
  }

  /**
   * Budget upsert
   */
  export type BudgetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Budget
     */
    select?: BudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Budget
     */
    omit?: BudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BudgetInclude<ExtArgs> | null
    /**
     * The filter to search for the Budget to update in case it exists.
     */
    where: BudgetWhereUniqueInput
    /**
     * In case the Budget found by the `where` argument doesn't exist, create a new Budget with this data.
     */
    create: XOR<BudgetCreateInput, BudgetUncheckedCreateInput>
    /**
     * In case the Budget was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BudgetUpdateInput, BudgetUncheckedUpdateInput>
  }

  /**
   * Budget delete
   */
  export type BudgetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Budget
     */
    select?: BudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Budget
     */
    omit?: BudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BudgetInclude<ExtArgs> | null
    /**
     * Filter which Budget to delete.
     */
    where: BudgetWhereUniqueInput
  }

  /**
   * Budget deleteMany
   */
  export type BudgetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Budgets to delete
     */
    where?: BudgetWhereInput
    /**
     * Limit how many Budgets to delete.
     */
    limit?: number
  }

  /**
   * Budget.lokasiHppList
   */
  export type Budget$lokasiHppListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPInclude<ExtArgs> | null
    where?: LokasiHPPWhereInput
    orderBy?: LokasiHPPOrderByWithRelationInput | LokasiHPPOrderByWithRelationInput[]
    cursor?: LokasiHPPWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LokasiHPPScalarFieldEnum | LokasiHPPScalarFieldEnum[]
  }

  /**
   * Budget without action
   */
  export type BudgetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Budget
     */
    select?: BudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Budget
     */
    omit?: BudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BudgetInclude<ExtArgs> | null
  }


  /**
   * Model LokasiHPP
   */

  export type AggregateLokasiHPP = {
    _count: LokasiHPPCountAggregateOutputType | null
    _avg: LokasiHPPAvgAggregateOutputType | null
    _sum: LokasiHPPSumAggregateOutputType | null
    _min: LokasiHPPMinAggregateOutputType | null
    _max: LokasiHPPMaxAggregateOutputType | null
  }

  export type LokasiHPPAvgAggregateOutputType = {
    periode: number | null
    tahun: number | null
    qtyPanen: Decimal | null
    luasPanen: Decimal | null
    luasAktif: Decimal | null
    biaya: Decimal | null
  }

  export type LokasiHPPSumAggregateOutputType = {
    periode: number | null
    tahun: number | null
    qtyPanen: Decimal | null
    luasPanen: Decimal | null
    luasAktif: Decimal | null
    biaya: Decimal | null
  }

  export type LokasiHPPMinAggregateOutputType = {
    idLokasiHpp: string | null
    idMaster: string | null
    lokasi: string | null
    idBudget: string | null
    periode: number | null
    tahun: number | null
    tanggalRawat: Date | null
    status: string | null
    jenisBibit: string | null
    kelasBibit: string | null
    qtyPanen: Decimal | null
    luasPanen: Decimal | null
    luasAktif: Decimal | null
    group: string | null
    descGroup: string | null
    jenisBiaya: string | null
    biaya: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LokasiHPPMaxAggregateOutputType = {
    idLokasiHpp: string | null
    idMaster: string | null
    lokasi: string | null
    idBudget: string | null
    periode: number | null
    tahun: number | null
    tanggalRawat: Date | null
    status: string | null
    jenisBibit: string | null
    kelasBibit: string | null
    qtyPanen: Decimal | null
    luasPanen: Decimal | null
    luasAktif: Decimal | null
    group: string | null
    descGroup: string | null
    jenisBiaya: string | null
    biaya: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LokasiHPPCountAggregateOutputType = {
    idLokasiHpp: number
    idMaster: number
    lokasi: number
    idBudget: number
    periode: number
    tahun: number
    tanggalRawat: number
    status: number
    jenisBibit: number
    kelasBibit: number
    qtyPanen: number
    luasPanen: number
    luasAktif: number
    group: number
    descGroup: number
    jenisBiaya: number
    biaya: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type LokasiHPPAvgAggregateInputType = {
    periode?: true
    tahun?: true
    qtyPanen?: true
    luasPanen?: true
    luasAktif?: true
    biaya?: true
  }

  export type LokasiHPPSumAggregateInputType = {
    periode?: true
    tahun?: true
    qtyPanen?: true
    luasPanen?: true
    luasAktif?: true
    biaya?: true
  }

  export type LokasiHPPMinAggregateInputType = {
    idLokasiHpp?: true
    idMaster?: true
    lokasi?: true
    idBudget?: true
    periode?: true
    tahun?: true
    tanggalRawat?: true
    status?: true
    jenisBibit?: true
    kelasBibit?: true
    qtyPanen?: true
    luasPanen?: true
    luasAktif?: true
    group?: true
    descGroup?: true
    jenisBiaya?: true
    biaya?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LokasiHPPMaxAggregateInputType = {
    idLokasiHpp?: true
    idMaster?: true
    lokasi?: true
    idBudget?: true
    periode?: true
    tahun?: true
    tanggalRawat?: true
    status?: true
    jenisBibit?: true
    kelasBibit?: true
    qtyPanen?: true
    luasPanen?: true
    luasAktif?: true
    group?: true
    descGroup?: true
    jenisBiaya?: true
    biaya?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LokasiHPPCountAggregateInputType = {
    idLokasiHpp?: true
    idMaster?: true
    lokasi?: true
    idBudget?: true
    periode?: true
    tahun?: true
    tanggalRawat?: true
    status?: true
    jenisBibit?: true
    kelasBibit?: true
    qtyPanen?: true
    luasPanen?: true
    luasAktif?: true
    group?: true
    descGroup?: true
    jenisBiaya?: true
    biaya?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type LokasiHPPAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LokasiHPP to aggregate.
     */
    where?: LokasiHPPWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LokasiHPPS to fetch.
     */
    orderBy?: LokasiHPPOrderByWithRelationInput | LokasiHPPOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LokasiHPPWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LokasiHPPS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LokasiHPPS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LokasiHPPS
    **/
    _count?: true | LokasiHPPCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LokasiHPPAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LokasiHPPSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LokasiHPPMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LokasiHPPMaxAggregateInputType
  }

  export type GetLokasiHPPAggregateType<T extends LokasiHPPAggregateArgs> = {
        [P in keyof T & keyof AggregateLokasiHPP]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLokasiHPP[P]>
      : GetScalarType<T[P], AggregateLokasiHPP[P]>
  }




  export type LokasiHPPGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LokasiHPPWhereInput
    orderBy?: LokasiHPPOrderByWithAggregationInput | LokasiHPPOrderByWithAggregationInput[]
    by: LokasiHPPScalarFieldEnum[] | LokasiHPPScalarFieldEnum
    having?: LokasiHPPScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LokasiHPPCountAggregateInputType | true
    _avg?: LokasiHPPAvgAggregateInputType
    _sum?: LokasiHPPSumAggregateInputType
    _min?: LokasiHPPMinAggregateInputType
    _max?: LokasiHPPMaxAggregateInputType
  }

  export type LokasiHPPGroupByOutputType = {
    idLokasiHpp: string
    idMaster: string | null
    lokasi: string
    idBudget: string
    periode: number
    tahun: number | null
    tanggalRawat: Date | null
    status: string
    jenisBibit: string | null
    kelasBibit: string | null
    qtyPanen: Decimal
    luasPanen: Decimal
    luasAktif: Decimal
    group: string
    descGroup: string
    jenisBiaya: string
    biaya: Decimal
    createdAt: Date
    updatedAt: Date
    _count: LokasiHPPCountAggregateOutputType | null
    _avg: LokasiHPPAvgAggregateOutputType | null
    _sum: LokasiHPPSumAggregateOutputType | null
    _min: LokasiHPPMinAggregateOutputType | null
    _max: LokasiHPPMaxAggregateOutputType | null
  }

  type GetLokasiHPPGroupByPayload<T extends LokasiHPPGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LokasiHPPGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LokasiHPPGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LokasiHPPGroupByOutputType[P]>
            : GetScalarType<T[P], LokasiHPPGroupByOutputType[P]>
        }
      >
    >


  export type LokasiHPPSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idLokasiHpp?: boolean
    idMaster?: boolean
    lokasi?: boolean
    idBudget?: boolean
    periode?: boolean
    tahun?: boolean
    tanggalRawat?: boolean
    status?: boolean
    jenisBibit?: boolean
    kelasBibit?: boolean
    qtyPanen?: boolean
    luasPanen?: boolean
    luasAktif?: boolean
    group?: boolean
    descGroup?: boolean
    jenisBiaya?: boolean
    biaya?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    masterSheet?: boolean | LokasiHPP$masterSheetArgs<ExtArgs>
    budgetItem?: boolean | BudgetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lokasiHPP"]>

  export type LokasiHPPSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idLokasiHpp?: boolean
    idMaster?: boolean
    lokasi?: boolean
    idBudget?: boolean
    periode?: boolean
    tahun?: boolean
    tanggalRawat?: boolean
    status?: boolean
    jenisBibit?: boolean
    kelasBibit?: boolean
    qtyPanen?: boolean
    luasPanen?: boolean
    luasAktif?: boolean
    group?: boolean
    descGroup?: boolean
    jenisBiaya?: boolean
    biaya?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    masterSheet?: boolean | LokasiHPP$masterSheetArgs<ExtArgs>
    budgetItem?: boolean | BudgetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lokasiHPP"]>

  export type LokasiHPPSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idLokasiHpp?: boolean
    idMaster?: boolean
    lokasi?: boolean
    idBudget?: boolean
    periode?: boolean
    tahun?: boolean
    tanggalRawat?: boolean
    status?: boolean
    jenisBibit?: boolean
    kelasBibit?: boolean
    qtyPanen?: boolean
    luasPanen?: boolean
    luasAktif?: boolean
    group?: boolean
    descGroup?: boolean
    jenisBiaya?: boolean
    biaya?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    masterSheet?: boolean | LokasiHPP$masterSheetArgs<ExtArgs>
    budgetItem?: boolean | BudgetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lokasiHPP"]>

  export type LokasiHPPSelectScalar = {
    idLokasiHpp?: boolean
    idMaster?: boolean
    lokasi?: boolean
    idBudget?: boolean
    periode?: boolean
    tahun?: boolean
    tanggalRawat?: boolean
    status?: boolean
    jenisBibit?: boolean
    kelasBibit?: boolean
    qtyPanen?: boolean
    luasPanen?: boolean
    luasAktif?: boolean
    group?: boolean
    descGroup?: boolean
    jenisBiaya?: boolean
    biaya?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type LokasiHPPOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idLokasiHpp" | "idMaster" | "lokasi" | "idBudget" | "periode" | "tahun" | "tanggalRawat" | "status" | "jenisBibit" | "kelasBibit" | "qtyPanen" | "luasPanen" | "luasAktif" | "group" | "descGroup" | "jenisBiaya" | "biaya" | "createdAt" | "updatedAt", ExtArgs["result"]["lokasiHPP"]>
  export type LokasiHPPInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    masterSheet?: boolean | LokasiHPP$masterSheetArgs<ExtArgs>
    budgetItem?: boolean | BudgetDefaultArgs<ExtArgs>
  }
  export type LokasiHPPIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    masterSheet?: boolean | LokasiHPP$masterSheetArgs<ExtArgs>
    budgetItem?: boolean | BudgetDefaultArgs<ExtArgs>
  }
  export type LokasiHPPIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    masterSheet?: boolean | LokasiHPP$masterSheetArgs<ExtArgs>
    budgetItem?: boolean | BudgetDefaultArgs<ExtArgs>
  }

  export type $LokasiHPPPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LokasiHPP"
    objects: {
      masterSheet: Prisma.$MasterSheetPayload<ExtArgs> | null
      budgetItem: Prisma.$BudgetPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      idLokasiHpp: string
      idMaster: string | null
      lokasi: string
      idBudget: string
      periode: number
      tahun: number | null
      tanggalRawat: Date | null
      status: string
      jenisBibit: string | null
      kelasBibit: string | null
      qtyPanen: Prisma.Decimal
      luasPanen: Prisma.Decimal
      luasAktif: Prisma.Decimal
      group: string
      descGroup: string
      jenisBiaya: string
      biaya: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["lokasiHPP"]>
    composites: {}
  }

  type LokasiHPPGetPayload<S extends boolean | null | undefined | LokasiHPPDefaultArgs> = $Result.GetResult<Prisma.$LokasiHPPPayload, S>

  type LokasiHPPCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LokasiHPPFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LokasiHPPCountAggregateInputType | true
    }

  export interface LokasiHPPDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LokasiHPP'], meta: { name: 'LokasiHPP' } }
    /**
     * Find zero or one LokasiHPP that matches the filter.
     * @param {LokasiHPPFindUniqueArgs} args - Arguments to find a LokasiHPP
     * @example
     * // Get one LokasiHPP
     * const lokasiHPP = await prisma.lokasiHPP.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LokasiHPPFindUniqueArgs>(args: SelectSubset<T, LokasiHPPFindUniqueArgs<ExtArgs>>): Prisma__LokasiHPPClient<$Result.GetResult<Prisma.$LokasiHPPPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LokasiHPP that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LokasiHPPFindUniqueOrThrowArgs} args - Arguments to find a LokasiHPP
     * @example
     * // Get one LokasiHPP
     * const lokasiHPP = await prisma.lokasiHPP.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LokasiHPPFindUniqueOrThrowArgs>(args: SelectSubset<T, LokasiHPPFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LokasiHPPClient<$Result.GetResult<Prisma.$LokasiHPPPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LokasiHPP that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LokasiHPPFindFirstArgs} args - Arguments to find a LokasiHPP
     * @example
     * // Get one LokasiHPP
     * const lokasiHPP = await prisma.lokasiHPP.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LokasiHPPFindFirstArgs>(args?: SelectSubset<T, LokasiHPPFindFirstArgs<ExtArgs>>): Prisma__LokasiHPPClient<$Result.GetResult<Prisma.$LokasiHPPPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LokasiHPP that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LokasiHPPFindFirstOrThrowArgs} args - Arguments to find a LokasiHPP
     * @example
     * // Get one LokasiHPP
     * const lokasiHPP = await prisma.lokasiHPP.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LokasiHPPFindFirstOrThrowArgs>(args?: SelectSubset<T, LokasiHPPFindFirstOrThrowArgs<ExtArgs>>): Prisma__LokasiHPPClient<$Result.GetResult<Prisma.$LokasiHPPPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LokasiHPPS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LokasiHPPFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LokasiHPPS
     * const lokasiHPPS = await prisma.lokasiHPP.findMany()
     * 
     * // Get first 10 LokasiHPPS
     * const lokasiHPPS = await prisma.lokasiHPP.findMany({ take: 10 })
     * 
     * // Only select the `idLokasiHpp`
     * const lokasiHPPWithIdLokasiHppOnly = await prisma.lokasiHPP.findMany({ select: { idLokasiHpp: true } })
     * 
     */
    findMany<T extends LokasiHPPFindManyArgs>(args?: SelectSubset<T, LokasiHPPFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LokasiHPPPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LokasiHPP.
     * @param {LokasiHPPCreateArgs} args - Arguments to create a LokasiHPP.
     * @example
     * // Create one LokasiHPP
     * const LokasiHPP = await prisma.lokasiHPP.create({
     *   data: {
     *     // ... data to create a LokasiHPP
     *   }
     * })
     * 
     */
    create<T extends LokasiHPPCreateArgs>(args: SelectSubset<T, LokasiHPPCreateArgs<ExtArgs>>): Prisma__LokasiHPPClient<$Result.GetResult<Prisma.$LokasiHPPPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LokasiHPPS.
     * @param {LokasiHPPCreateManyArgs} args - Arguments to create many LokasiHPPS.
     * @example
     * // Create many LokasiHPPS
     * const lokasiHPP = await prisma.lokasiHPP.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LokasiHPPCreateManyArgs>(args?: SelectSubset<T, LokasiHPPCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LokasiHPPS and returns the data saved in the database.
     * @param {LokasiHPPCreateManyAndReturnArgs} args - Arguments to create many LokasiHPPS.
     * @example
     * // Create many LokasiHPPS
     * const lokasiHPP = await prisma.lokasiHPP.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LokasiHPPS and only return the `idLokasiHpp`
     * const lokasiHPPWithIdLokasiHppOnly = await prisma.lokasiHPP.createManyAndReturn({
     *   select: { idLokasiHpp: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LokasiHPPCreateManyAndReturnArgs>(args?: SelectSubset<T, LokasiHPPCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LokasiHPPPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LokasiHPP.
     * @param {LokasiHPPDeleteArgs} args - Arguments to delete one LokasiHPP.
     * @example
     * // Delete one LokasiHPP
     * const LokasiHPP = await prisma.lokasiHPP.delete({
     *   where: {
     *     // ... filter to delete one LokasiHPP
     *   }
     * })
     * 
     */
    delete<T extends LokasiHPPDeleteArgs>(args: SelectSubset<T, LokasiHPPDeleteArgs<ExtArgs>>): Prisma__LokasiHPPClient<$Result.GetResult<Prisma.$LokasiHPPPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LokasiHPP.
     * @param {LokasiHPPUpdateArgs} args - Arguments to update one LokasiHPP.
     * @example
     * // Update one LokasiHPP
     * const lokasiHPP = await prisma.lokasiHPP.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LokasiHPPUpdateArgs>(args: SelectSubset<T, LokasiHPPUpdateArgs<ExtArgs>>): Prisma__LokasiHPPClient<$Result.GetResult<Prisma.$LokasiHPPPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LokasiHPPS.
     * @param {LokasiHPPDeleteManyArgs} args - Arguments to filter LokasiHPPS to delete.
     * @example
     * // Delete a few LokasiHPPS
     * const { count } = await prisma.lokasiHPP.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LokasiHPPDeleteManyArgs>(args?: SelectSubset<T, LokasiHPPDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LokasiHPPS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LokasiHPPUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LokasiHPPS
     * const lokasiHPP = await prisma.lokasiHPP.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LokasiHPPUpdateManyArgs>(args: SelectSubset<T, LokasiHPPUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LokasiHPPS and returns the data updated in the database.
     * @param {LokasiHPPUpdateManyAndReturnArgs} args - Arguments to update many LokasiHPPS.
     * @example
     * // Update many LokasiHPPS
     * const lokasiHPP = await prisma.lokasiHPP.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LokasiHPPS and only return the `idLokasiHpp`
     * const lokasiHPPWithIdLokasiHppOnly = await prisma.lokasiHPP.updateManyAndReturn({
     *   select: { idLokasiHpp: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LokasiHPPUpdateManyAndReturnArgs>(args: SelectSubset<T, LokasiHPPUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LokasiHPPPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LokasiHPP.
     * @param {LokasiHPPUpsertArgs} args - Arguments to update or create a LokasiHPP.
     * @example
     * // Update or create a LokasiHPP
     * const lokasiHPP = await prisma.lokasiHPP.upsert({
     *   create: {
     *     // ... data to create a LokasiHPP
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LokasiHPP we want to update
     *   }
     * })
     */
    upsert<T extends LokasiHPPUpsertArgs>(args: SelectSubset<T, LokasiHPPUpsertArgs<ExtArgs>>): Prisma__LokasiHPPClient<$Result.GetResult<Prisma.$LokasiHPPPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LokasiHPPS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LokasiHPPCountArgs} args - Arguments to filter LokasiHPPS to count.
     * @example
     * // Count the number of LokasiHPPS
     * const count = await prisma.lokasiHPP.count({
     *   where: {
     *     // ... the filter for the LokasiHPPS we want to count
     *   }
     * })
    **/
    count<T extends LokasiHPPCountArgs>(
      args?: Subset<T, LokasiHPPCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LokasiHPPCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LokasiHPP.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LokasiHPPAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LokasiHPPAggregateArgs>(args: Subset<T, LokasiHPPAggregateArgs>): Prisma.PrismaPromise<GetLokasiHPPAggregateType<T>>

    /**
     * Group by LokasiHPP.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LokasiHPPGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LokasiHPPGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LokasiHPPGroupByArgs['orderBy'] }
        : { orderBy?: LokasiHPPGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LokasiHPPGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLokasiHPPGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LokasiHPP model
   */
  readonly fields: LokasiHPPFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LokasiHPP.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LokasiHPPClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    masterSheet<T extends LokasiHPP$masterSheetArgs<ExtArgs> = {}>(args?: Subset<T, LokasiHPP$masterSheetArgs<ExtArgs>>): Prisma__MasterSheetClient<$Result.GetResult<Prisma.$MasterSheetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    budgetItem<T extends BudgetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BudgetDefaultArgs<ExtArgs>>): Prisma__BudgetClient<$Result.GetResult<Prisma.$BudgetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LokasiHPP model
   */
  interface LokasiHPPFieldRefs {
    readonly idLokasiHpp: FieldRef<"LokasiHPP", 'String'>
    readonly idMaster: FieldRef<"LokasiHPP", 'String'>
    readonly lokasi: FieldRef<"LokasiHPP", 'String'>
    readonly idBudget: FieldRef<"LokasiHPP", 'String'>
    readonly periode: FieldRef<"LokasiHPP", 'Int'>
    readonly tahun: FieldRef<"LokasiHPP", 'Int'>
    readonly tanggalRawat: FieldRef<"LokasiHPP", 'DateTime'>
    readonly status: FieldRef<"LokasiHPP", 'String'>
    readonly jenisBibit: FieldRef<"LokasiHPP", 'String'>
    readonly kelasBibit: FieldRef<"LokasiHPP", 'String'>
    readonly qtyPanen: FieldRef<"LokasiHPP", 'Decimal'>
    readonly luasPanen: FieldRef<"LokasiHPP", 'Decimal'>
    readonly luasAktif: FieldRef<"LokasiHPP", 'Decimal'>
    readonly group: FieldRef<"LokasiHPP", 'String'>
    readonly descGroup: FieldRef<"LokasiHPP", 'String'>
    readonly jenisBiaya: FieldRef<"LokasiHPP", 'String'>
    readonly biaya: FieldRef<"LokasiHPP", 'Decimal'>
    readonly createdAt: FieldRef<"LokasiHPP", 'DateTime'>
    readonly updatedAt: FieldRef<"LokasiHPP", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LokasiHPP findUnique
   */
  export type LokasiHPPFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPInclude<ExtArgs> | null
    /**
     * Filter, which LokasiHPP to fetch.
     */
    where: LokasiHPPWhereUniqueInput
  }

  /**
   * LokasiHPP findUniqueOrThrow
   */
  export type LokasiHPPFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPInclude<ExtArgs> | null
    /**
     * Filter, which LokasiHPP to fetch.
     */
    where: LokasiHPPWhereUniqueInput
  }

  /**
   * LokasiHPP findFirst
   */
  export type LokasiHPPFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPInclude<ExtArgs> | null
    /**
     * Filter, which LokasiHPP to fetch.
     */
    where?: LokasiHPPWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LokasiHPPS to fetch.
     */
    orderBy?: LokasiHPPOrderByWithRelationInput | LokasiHPPOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LokasiHPPS.
     */
    cursor?: LokasiHPPWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LokasiHPPS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LokasiHPPS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LokasiHPPS.
     */
    distinct?: LokasiHPPScalarFieldEnum | LokasiHPPScalarFieldEnum[]
  }

  /**
   * LokasiHPP findFirstOrThrow
   */
  export type LokasiHPPFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPInclude<ExtArgs> | null
    /**
     * Filter, which LokasiHPP to fetch.
     */
    where?: LokasiHPPWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LokasiHPPS to fetch.
     */
    orderBy?: LokasiHPPOrderByWithRelationInput | LokasiHPPOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LokasiHPPS.
     */
    cursor?: LokasiHPPWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LokasiHPPS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LokasiHPPS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LokasiHPPS.
     */
    distinct?: LokasiHPPScalarFieldEnum | LokasiHPPScalarFieldEnum[]
  }

  /**
   * LokasiHPP findMany
   */
  export type LokasiHPPFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPInclude<ExtArgs> | null
    /**
     * Filter, which LokasiHPPS to fetch.
     */
    where?: LokasiHPPWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LokasiHPPS to fetch.
     */
    orderBy?: LokasiHPPOrderByWithRelationInput | LokasiHPPOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LokasiHPPS.
     */
    cursor?: LokasiHPPWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LokasiHPPS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LokasiHPPS.
     */
    skip?: number
    distinct?: LokasiHPPScalarFieldEnum | LokasiHPPScalarFieldEnum[]
  }

  /**
   * LokasiHPP create
   */
  export type LokasiHPPCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPInclude<ExtArgs> | null
    /**
     * The data needed to create a LokasiHPP.
     */
    data: XOR<LokasiHPPCreateInput, LokasiHPPUncheckedCreateInput>
  }

  /**
   * LokasiHPP createMany
   */
  export type LokasiHPPCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LokasiHPPS.
     */
    data: LokasiHPPCreateManyInput | LokasiHPPCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LokasiHPP createManyAndReturn
   */
  export type LokasiHPPCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * The data used to create many LokasiHPPS.
     */
    data: LokasiHPPCreateManyInput | LokasiHPPCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LokasiHPP update
   */
  export type LokasiHPPUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPInclude<ExtArgs> | null
    /**
     * The data needed to update a LokasiHPP.
     */
    data: XOR<LokasiHPPUpdateInput, LokasiHPPUncheckedUpdateInput>
    /**
     * Choose, which LokasiHPP to update.
     */
    where: LokasiHPPWhereUniqueInput
  }

  /**
   * LokasiHPP updateMany
   */
  export type LokasiHPPUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LokasiHPPS.
     */
    data: XOR<LokasiHPPUpdateManyMutationInput, LokasiHPPUncheckedUpdateManyInput>
    /**
     * Filter which LokasiHPPS to update
     */
    where?: LokasiHPPWhereInput
    /**
     * Limit how many LokasiHPPS to update.
     */
    limit?: number
  }

  /**
   * LokasiHPP updateManyAndReturn
   */
  export type LokasiHPPUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * The data used to update LokasiHPPS.
     */
    data: XOR<LokasiHPPUpdateManyMutationInput, LokasiHPPUncheckedUpdateManyInput>
    /**
     * Filter which LokasiHPPS to update
     */
    where?: LokasiHPPWhereInput
    /**
     * Limit how many LokasiHPPS to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LokasiHPP upsert
   */
  export type LokasiHPPUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPInclude<ExtArgs> | null
    /**
     * The filter to search for the LokasiHPP to update in case it exists.
     */
    where: LokasiHPPWhereUniqueInput
    /**
     * In case the LokasiHPP found by the `where` argument doesn't exist, create a new LokasiHPP with this data.
     */
    create: XOR<LokasiHPPCreateInput, LokasiHPPUncheckedCreateInput>
    /**
     * In case the LokasiHPP was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LokasiHPPUpdateInput, LokasiHPPUncheckedUpdateInput>
  }

  /**
   * LokasiHPP delete
   */
  export type LokasiHPPDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPInclude<ExtArgs> | null
    /**
     * Filter which LokasiHPP to delete.
     */
    where: LokasiHPPWhereUniqueInput
  }

  /**
   * LokasiHPP deleteMany
   */
  export type LokasiHPPDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LokasiHPPS to delete
     */
    where?: LokasiHPPWhereInput
    /**
     * Limit how many LokasiHPPS to delete.
     */
    limit?: number
  }

  /**
   * LokasiHPP.masterSheet
   */
  export type LokasiHPP$masterSheetArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterSheetInclude<ExtArgs> | null
    where?: MasterSheetWhereInput
  }

  /**
   * LokasiHPP without action
   */
  export type LokasiHPPDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LokasiHPP
     */
    select?: LokasiHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LokasiHPP
     */
    omit?: LokasiHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LokasiHPPInclude<ExtArgs> | null
  }


  /**
   * Model AktivitasHPP
   */

  export type AggregateAktivitasHPP = {
    _count: AktivitasHPPCountAggregateOutputType | null
    _avg: AktivitasHPPAvgAggregateOutputType | null
    _sum: AktivitasHPPSumAggregateOutputType | null
    _min: AktivitasHPPMinAggregateOutputType | null
    _max: AktivitasHPPMaxAggregateOutputType | null
  }

  export type AktivitasHPPAvgAggregateOutputType = {
    biaya: Decimal | null
    hasil: Decimal | null
  }

  export type AktivitasHPPSumAggregateOutputType = {
    biaya: Decimal | null
    hasil: Decimal | null
  }

  export type AktivitasHPPMinAggregateOutputType = {
    idAktivitas: string | null
    idMaster: string | null
    lokasi: string | null
    tanggalMulaiRawat: Date | null
    tanggalMulaiTanam: Date | null
    tanggalForcingStandard: Date | null
    rencanaForcing: Date | null
    realForcing: Date | null
    rencanaPanen: Date | null
    aktivitas: string | null
    biaya: Decimal | null
    hasil: Decimal | null
    uom: string | null
    group: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AktivitasHPPMaxAggregateOutputType = {
    idAktivitas: string | null
    idMaster: string | null
    lokasi: string | null
    tanggalMulaiRawat: Date | null
    tanggalMulaiTanam: Date | null
    tanggalForcingStandard: Date | null
    rencanaForcing: Date | null
    realForcing: Date | null
    rencanaPanen: Date | null
    aktivitas: string | null
    biaya: Decimal | null
    hasil: Decimal | null
    uom: string | null
    group: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AktivitasHPPCountAggregateOutputType = {
    idAktivitas: number
    idMaster: number
    lokasi: number
    tanggalMulaiRawat: number
    tanggalMulaiTanam: number
    tanggalForcingStandard: number
    rencanaForcing: number
    realForcing: number
    rencanaPanen: number
    aktivitas: number
    biaya: number
    hasil: number
    uom: number
    group: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AktivitasHPPAvgAggregateInputType = {
    biaya?: true
    hasil?: true
  }

  export type AktivitasHPPSumAggregateInputType = {
    biaya?: true
    hasil?: true
  }

  export type AktivitasHPPMinAggregateInputType = {
    idAktivitas?: true
    idMaster?: true
    lokasi?: true
    tanggalMulaiRawat?: true
    tanggalMulaiTanam?: true
    tanggalForcingStandard?: true
    rencanaForcing?: true
    realForcing?: true
    rencanaPanen?: true
    aktivitas?: true
    biaya?: true
    hasil?: true
    uom?: true
    group?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AktivitasHPPMaxAggregateInputType = {
    idAktivitas?: true
    idMaster?: true
    lokasi?: true
    tanggalMulaiRawat?: true
    tanggalMulaiTanam?: true
    tanggalForcingStandard?: true
    rencanaForcing?: true
    realForcing?: true
    rencanaPanen?: true
    aktivitas?: true
    biaya?: true
    hasil?: true
    uom?: true
    group?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AktivitasHPPCountAggregateInputType = {
    idAktivitas?: true
    idMaster?: true
    lokasi?: true
    tanggalMulaiRawat?: true
    tanggalMulaiTanam?: true
    tanggalForcingStandard?: true
    rencanaForcing?: true
    realForcing?: true
    rencanaPanen?: true
    aktivitas?: true
    biaya?: true
    hasil?: true
    uom?: true
    group?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AktivitasHPPAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AktivitasHPP to aggregate.
     */
    where?: AktivitasHPPWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AktivitasHPPS to fetch.
     */
    orderBy?: AktivitasHPPOrderByWithRelationInput | AktivitasHPPOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AktivitasHPPWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AktivitasHPPS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AktivitasHPPS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AktivitasHPPS
    **/
    _count?: true | AktivitasHPPCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AktivitasHPPAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AktivitasHPPSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AktivitasHPPMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AktivitasHPPMaxAggregateInputType
  }

  export type GetAktivitasHPPAggregateType<T extends AktivitasHPPAggregateArgs> = {
        [P in keyof T & keyof AggregateAktivitasHPP]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAktivitasHPP[P]>
      : GetScalarType<T[P], AggregateAktivitasHPP[P]>
  }




  export type AktivitasHPPGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AktivitasHPPWhereInput
    orderBy?: AktivitasHPPOrderByWithAggregationInput | AktivitasHPPOrderByWithAggregationInput[]
    by: AktivitasHPPScalarFieldEnum[] | AktivitasHPPScalarFieldEnum
    having?: AktivitasHPPScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AktivitasHPPCountAggregateInputType | true
    _avg?: AktivitasHPPAvgAggregateInputType
    _sum?: AktivitasHPPSumAggregateInputType
    _min?: AktivitasHPPMinAggregateInputType
    _max?: AktivitasHPPMaxAggregateInputType
  }

  export type AktivitasHPPGroupByOutputType = {
    idAktivitas: string
    idMaster: string | null
    lokasi: string
    tanggalMulaiRawat: Date | null
    tanggalMulaiTanam: Date | null
    tanggalForcingStandard: Date | null
    rencanaForcing: Date | null
    realForcing: Date | null
    rencanaPanen: Date | null
    aktivitas: string
    biaya: Decimal
    hasil: Decimal
    uom: string
    group: string
    createdAt: Date
    updatedAt: Date
    _count: AktivitasHPPCountAggregateOutputType | null
    _avg: AktivitasHPPAvgAggregateOutputType | null
    _sum: AktivitasHPPSumAggregateOutputType | null
    _min: AktivitasHPPMinAggregateOutputType | null
    _max: AktivitasHPPMaxAggregateOutputType | null
  }

  type GetAktivitasHPPGroupByPayload<T extends AktivitasHPPGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AktivitasHPPGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AktivitasHPPGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AktivitasHPPGroupByOutputType[P]>
            : GetScalarType<T[P], AktivitasHPPGroupByOutputType[P]>
        }
      >
    >


  export type AktivitasHPPSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idAktivitas?: boolean
    idMaster?: boolean
    lokasi?: boolean
    tanggalMulaiRawat?: boolean
    tanggalMulaiTanam?: boolean
    tanggalForcingStandard?: boolean
    rencanaForcing?: boolean
    realForcing?: boolean
    rencanaPanen?: boolean
    aktivitas?: boolean
    biaya?: boolean
    hasil?: boolean
    uom?: boolean
    group?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    masterSheet?: boolean | AktivitasHPP$masterSheetArgs<ExtArgs>
  }, ExtArgs["result"]["aktivitasHPP"]>

  export type AktivitasHPPSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idAktivitas?: boolean
    idMaster?: boolean
    lokasi?: boolean
    tanggalMulaiRawat?: boolean
    tanggalMulaiTanam?: boolean
    tanggalForcingStandard?: boolean
    rencanaForcing?: boolean
    realForcing?: boolean
    rencanaPanen?: boolean
    aktivitas?: boolean
    biaya?: boolean
    hasil?: boolean
    uom?: boolean
    group?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    masterSheet?: boolean | AktivitasHPP$masterSheetArgs<ExtArgs>
  }, ExtArgs["result"]["aktivitasHPP"]>

  export type AktivitasHPPSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idAktivitas?: boolean
    idMaster?: boolean
    lokasi?: boolean
    tanggalMulaiRawat?: boolean
    tanggalMulaiTanam?: boolean
    tanggalForcingStandard?: boolean
    rencanaForcing?: boolean
    realForcing?: boolean
    rencanaPanen?: boolean
    aktivitas?: boolean
    biaya?: boolean
    hasil?: boolean
    uom?: boolean
    group?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    masterSheet?: boolean | AktivitasHPP$masterSheetArgs<ExtArgs>
  }, ExtArgs["result"]["aktivitasHPP"]>

  export type AktivitasHPPSelectScalar = {
    idAktivitas?: boolean
    idMaster?: boolean
    lokasi?: boolean
    tanggalMulaiRawat?: boolean
    tanggalMulaiTanam?: boolean
    tanggalForcingStandard?: boolean
    rencanaForcing?: boolean
    realForcing?: boolean
    rencanaPanen?: boolean
    aktivitas?: boolean
    biaya?: boolean
    hasil?: boolean
    uom?: boolean
    group?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AktivitasHPPOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idAktivitas" | "idMaster" | "lokasi" | "tanggalMulaiRawat" | "tanggalMulaiTanam" | "tanggalForcingStandard" | "rencanaForcing" | "realForcing" | "rencanaPanen" | "aktivitas" | "biaya" | "hasil" | "uom" | "group" | "createdAt" | "updatedAt", ExtArgs["result"]["aktivitasHPP"]>
  export type AktivitasHPPInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    masterSheet?: boolean | AktivitasHPP$masterSheetArgs<ExtArgs>
  }
  export type AktivitasHPPIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    masterSheet?: boolean | AktivitasHPP$masterSheetArgs<ExtArgs>
  }
  export type AktivitasHPPIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    masterSheet?: boolean | AktivitasHPP$masterSheetArgs<ExtArgs>
  }

  export type $AktivitasHPPPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AktivitasHPP"
    objects: {
      masterSheet: Prisma.$MasterSheetPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      idAktivitas: string
      idMaster: string | null
      lokasi: string
      tanggalMulaiRawat: Date | null
      tanggalMulaiTanam: Date | null
      tanggalForcingStandard: Date | null
      rencanaForcing: Date | null
      realForcing: Date | null
      rencanaPanen: Date | null
      aktivitas: string
      biaya: Prisma.Decimal
      hasil: Prisma.Decimal
      uom: string
      group: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["aktivitasHPP"]>
    composites: {}
  }

  type AktivitasHPPGetPayload<S extends boolean | null | undefined | AktivitasHPPDefaultArgs> = $Result.GetResult<Prisma.$AktivitasHPPPayload, S>

  type AktivitasHPPCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AktivitasHPPFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AktivitasHPPCountAggregateInputType | true
    }

  export interface AktivitasHPPDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AktivitasHPP'], meta: { name: 'AktivitasHPP' } }
    /**
     * Find zero or one AktivitasHPP that matches the filter.
     * @param {AktivitasHPPFindUniqueArgs} args - Arguments to find a AktivitasHPP
     * @example
     * // Get one AktivitasHPP
     * const aktivitasHPP = await prisma.aktivitasHPP.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AktivitasHPPFindUniqueArgs>(args: SelectSubset<T, AktivitasHPPFindUniqueArgs<ExtArgs>>): Prisma__AktivitasHPPClient<$Result.GetResult<Prisma.$AktivitasHPPPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AktivitasHPP that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AktivitasHPPFindUniqueOrThrowArgs} args - Arguments to find a AktivitasHPP
     * @example
     * // Get one AktivitasHPP
     * const aktivitasHPP = await prisma.aktivitasHPP.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AktivitasHPPFindUniqueOrThrowArgs>(args: SelectSubset<T, AktivitasHPPFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AktivitasHPPClient<$Result.GetResult<Prisma.$AktivitasHPPPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AktivitasHPP that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AktivitasHPPFindFirstArgs} args - Arguments to find a AktivitasHPP
     * @example
     * // Get one AktivitasHPP
     * const aktivitasHPP = await prisma.aktivitasHPP.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AktivitasHPPFindFirstArgs>(args?: SelectSubset<T, AktivitasHPPFindFirstArgs<ExtArgs>>): Prisma__AktivitasHPPClient<$Result.GetResult<Prisma.$AktivitasHPPPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AktivitasHPP that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AktivitasHPPFindFirstOrThrowArgs} args - Arguments to find a AktivitasHPP
     * @example
     * // Get one AktivitasHPP
     * const aktivitasHPP = await prisma.aktivitasHPP.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AktivitasHPPFindFirstOrThrowArgs>(args?: SelectSubset<T, AktivitasHPPFindFirstOrThrowArgs<ExtArgs>>): Prisma__AktivitasHPPClient<$Result.GetResult<Prisma.$AktivitasHPPPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AktivitasHPPS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AktivitasHPPFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AktivitasHPPS
     * const aktivitasHPPS = await prisma.aktivitasHPP.findMany()
     * 
     * // Get first 10 AktivitasHPPS
     * const aktivitasHPPS = await prisma.aktivitasHPP.findMany({ take: 10 })
     * 
     * // Only select the `idAktivitas`
     * const aktivitasHPPWithIdAktivitasOnly = await prisma.aktivitasHPP.findMany({ select: { idAktivitas: true } })
     * 
     */
    findMany<T extends AktivitasHPPFindManyArgs>(args?: SelectSubset<T, AktivitasHPPFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AktivitasHPPPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AktivitasHPP.
     * @param {AktivitasHPPCreateArgs} args - Arguments to create a AktivitasHPP.
     * @example
     * // Create one AktivitasHPP
     * const AktivitasHPP = await prisma.aktivitasHPP.create({
     *   data: {
     *     // ... data to create a AktivitasHPP
     *   }
     * })
     * 
     */
    create<T extends AktivitasHPPCreateArgs>(args: SelectSubset<T, AktivitasHPPCreateArgs<ExtArgs>>): Prisma__AktivitasHPPClient<$Result.GetResult<Prisma.$AktivitasHPPPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AktivitasHPPS.
     * @param {AktivitasHPPCreateManyArgs} args - Arguments to create many AktivitasHPPS.
     * @example
     * // Create many AktivitasHPPS
     * const aktivitasHPP = await prisma.aktivitasHPP.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AktivitasHPPCreateManyArgs>(args?: SelectSubset<T, AktivitasHPPCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AktivitasHPPS and returns the data saved in the database.
     * @param {AktivitasHPPCreateManyAndReturnArgs} args - Arguments to create many AktivitasHPPS.
     * @example
     * // Create many AktivitasHPPS
     * const aktivitasHPP = await prisma.aktivitasHPP.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AktivitasHPPS and only return the `idAktivitas`
     * const aktivitasHPPWithIdAktivitasOnly = await prisma.aktivitasHPP.createManyAndReturn({
     *   select: { idAktivitas: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AktivitasHPPCreateManyAndReturnArgs>(args?: SelectSubset<T, AktivitasHPPCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AktivitasHPPPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AktivitasHPP.
     * @param {AktivitasHPPDeleteArgs} args - Arguments to delete one AktivitasHPP.
     * @example
     * // Delete one AktivitasHPP
     * const AktivitasHPP = await prisma.aktivitasHPP.delete({
     *   where: {
     *     // ... filter to delete one AktivitasHPP
     *   }
     * })
     * 
     */
    delete<T extends AktivitasHPPDeleteArgs>(args: SelectSubset<T, AktivitasHPPDeleteArgs<ExtArgs>>): Prisma__AktivitasHPPClient<$Result.GetResult<Prisma.$AktivitasHPPPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AktivitasHPP.
     * @param {AktivitasHPPUpdateArgs} args - Arguments to update one AktivitasHPP.
     * @example
     * // Update one AktivitasHPP
     * const aktivitasHPP = await prisma.aktivitasHPP.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AktivitasHPPUpdateArgs>(args: SelectSubset<T, AktivitasHPPUpdateArgs<ExtArgs>>): Prisma__AktivitasHPPClient<$Result.GetResult<Prisma.$AktivitasHPPPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AktivitasHPPS.
     * @param {AktivitasHPPDeleteManyArgs} args - Arguments to filter AktivitasHPPS to delete.
     * @example
     * // Delete a few AktivitasHPPS
     * const { count } = await prisma.aktivitasHPP.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AktivitasHPPDeleteManyArgs>(args?: SelectSubset<T, AktivitasHPPDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AktivitasHPPS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AktivitasHPPUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AktivitasHPPS
     * const aktivitasHPP = await prisma.aktivitasHPP.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AktivitasHPPUpdateManyArgs>(args: SelectSubset<T, AktivitasHPPUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AktivitasHPPS and returns the data updated in the database.
     * @param {AktivitasHPPUpdateManyAndReturnArgs} args - Arguments to update many AktivitasHPPS.
     * @example
     * // Update many AktivitasHPPS
     * const aktivitasHPP = await prisma.aktivitasHPP.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AktivitasHPPS and only return the `idAktivitas`
     * const aktivitasHPPWithIdAktivitasOnly = await prisma.aktivitasHPP.updateManyAndReturn({
     *   select: { idAktivitas: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AktivitasHPPUpdateManyAndReturnArgs>(args: SelectSubset<T, AktivitasHPPUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AktivitasHPPPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AktivitasHPP.
     * @param {AktivitasHPPUpsertArgs} args - Arguments to update or create a AktivitasHPP.
     * @example
     * // Update or create a AktivitasHPP
     * const aktivitasHPP = await prisma.aktivitasHPP.upsert({
     *   create: {
     *     // ... data to create a AktivitasHPP
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AktivitasHPP we want to update
     *   }
     * })
     */
    upsert<T extends AktivitasHPPUpsertArgs>(args: SelectSubset<T, AktivitasHPPUpsertArgs<ExtArgs>>): Prisma__AktivitasHPPClient<$Result.GetResult<Prisma.$AktivitasHPPPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AktivitasHPPS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AktivitasHPPCountArgs} args - Arguments to filter AktivitasHPPS to count.
     * @example
     * // Count the number of AktivitasHPPS
     * const count = await prisma.aktivitasHPP.count({
     *   where: {
     *     // ... the filter for the AktivitasHPPS we want to count
     *   }
     * })
    **/
    count<T extends AktivitasHPPCountArgs>(
      args?: Subset<T, AktivitasHPPCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AktivitasHPPCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AktivitasHPP.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AktivitasHPPAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AktivitasHPPAggregateArgs>(args: Subset<T, AktivitasHPPAggregateArgs>): Prisma.PrismaPromise<GetAktivitasHPPAggregateType<T>>

    /**
     * Group by AktivitasHPP.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AktivitasHPPGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AktivitasHPPGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AktivitasHPPGroupByArgs['orderBy'] }
        : { orderBy?: AktivitasHPPGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AktivitasHPPGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAktivitasHPPGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AktivitasHPP model
   */
  readonly fields: AktivitasHPPFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AktivitasHPP.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AktivitasHPPClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    masterSheet<T extends AktivitasHPP$masterSheetArgs<ExtArgs> = {}>(args?: Subset<T, AktivitasHPP$masterSheetArgs<ExtArgs>>): Prisma__MasterSheetClient<$Result.GetResult<Prisma.$MasterSheetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AktivitasHPP model
   */
  interface AktivitasHPPFieldRefs {
    readonly idAktivitas: FieldRef<"AktivitasHPP", 'String'>
    readonly idMaster: FieldRef<"AktivitasHPP", 'String'>
    readonly lokasi: FieldRef<"AktivitasHPP", 'String'>
    readonly tanggalMulaiRawat: FieldRef<"AktivitasHPP", 'DateTime'>
    readonly tanggalMulaiTanam: FieldRef<"AktivitasHPP", 'DateTime'>
    readonly tanggalForcingStandard: FieldRef<"AktivitasHPP", 'DateTime'>
    readonly rencanaForcing: FieldRef<"AktivitasHPP", 'DateTime'>
    readonly realForcing: FieldRef<"AktivitasHPP", 'DateTime'>
    readonly rencanaPanen: FieldRef<"AktivitasHPP", 'DateTime'>
    readonly aktivitas: FieldRef<"AktivitasHPP", 'String'>
    readonly biaya: FieldRef<"AktivitasHPP", 'Decimal'>
    readonly hasil: FieldRef<"AktivitasHPP", 'Decimal'>
    readonly uom: FieldRef<"AktivitasHPP", 'String'>
    readonly group: FieldRef<"AktivitasHPP", 'String'>
    readonly createdAt: FieldRef<"AktivitasHPP", 'DateTime'>
    readonly updatedAt: FieldRef<"AktivitasHPP", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AktivitasHPP findUnique
   */
  export type AktivitasHPPFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AktivitasHPP
     */
    select?: AktivitasHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AktivitasHPP
     */
    omit?: AktivitasHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AktivitasHPPInclude<ExtArgs> | null
    /**
     * Filter, which AktivitasHPP to fetch.
     */
    where: AktivitasHPPWhereUniqueInput
  }

  /**
   * AktivitasHPP findUniqueOrThrow
   */
  export type AktivitasHPPFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AktivitasHPP
     */
    select?: AktivitasHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AktivitasHPP
     */
    omit?: AktivitasHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AktivitasHPPInclude<ExtArgs> | null
    /**
     * Filter, which AktivitasHPP to fetch.
     */
    where: AktivitasHPPWhereUniqueInput
  }

  /**
   * AktivitasHPP findFirst
   */
  export type AktivitasHPPFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AktivitasHPP
     */
    select?: AktivitasHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AktivitasHPP
     */
    omit?: AktivitasHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AktivitasHPPInclude<ExtArgs> | null
    /**
     * Filter, which AktivitasHPP to fetch.
     */
    where?: AktivitasHPPWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AktivitasHPPS to fetch.
     */
    orderBy?: AktivitasHPPOrderByWithRelationInput | AktivitasHPPOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AktivitasHPPS.
     */
    cursor?: AktivitasHPPWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AktivitasHPPS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AktivitasHPPS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AktivitasHPPS.
     */
    distinct?: AktivitasHPPScalarFieldEnum | AktivitasHPPScalarFieldEnum[]
  }

  /**
   * AktivitasHPP findFirstOrThrow
   */
  export type AktivitasHPPFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AktivitasHPP
     */
    select?: AktivitasHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AktivitasHPP
     */
    omit?: AktivitasHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AktivitasHPPInclude<ExtArgs> | null
    /**
     * Filter, which AktivitasHPP to fetch.
     */
    where?: AktivitasHPPWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AktivitasHPPS to fetch.
     */
    orderBy?: AktivitasHPPOrderByWithRelationInput | AktivitasHPPOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AktivitasHPPS.
     */
    cursor?: AktivitasHPPWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AktivitasHPPS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AktivitasHPPS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AktivitasHPPS.
     */
    distinct?: AktivitasHPPScalarFieldEnum | AktivitasHPPScalarFieldEnum[]
  }

  /**
   * AktivitasHPP findMany
   */
  export type AktivitasHPPFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AktivitasHPP
     */
    select?: AktivitasHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AktivitasHPP
     */
    omit?: AktivitasHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AktivitasHPPInclude<ExtArgs> | null
    /**
     * Filter, which AktivitasHPPS to fetch.
     */
    where?: AktivitasHPPWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AktivitasHPPS to fetch.
     */
    orderBy?: AktivitasHPPOrderByWithRelationInput | AktivitasHPPOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AktivitasHPPS.
     */
    cursor?: AktivitasHPPWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AktivitasHPPS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AktivitasHPPS.
     */
    skip?: number
    distinct?: AktivitasHPPScalarFieldEnum | AktivitasHPPScalarFieldEnum[]
  }

  /**
   * AktivitasHPP create
   */
  export type AktivitasHPPCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AktivitasHPP
     */
    select?: AktivitasHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AktivitasHPP
     */
    omit?: AktivitasHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AktivitasHPPInclude<ExtArgs> | null
    /**
     * The data needed to create a AktivitasHPP.
     */
    data: XOR<AktivitasHPPCreateInput, AktivitasHPPUncheckedCreateInput>
  }

  /**
   * AktivitasHPP createMany
   */
  export type AktivitasHPPCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AktivitasHPPS.
     */
    data: AktivitasHPPCreateManyInput | AktivitasHPPCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AktivitasHPP createManyAndReturn
   */
  export type AktivitasHPPCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AktivitasHPP
     */
    select?: AktivitasHPPSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AktivitasHPP
     */
    omit?: AktivitasHPPOmit<ExtArgs> | null
    /**
     * The data used to create many AktivitasHPPS.
     */
    data: AktivitasHPPCreateManyInput | AktivitasHPPCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AktivitasHPPIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AktivitasHPP update
   */
  export type AktivitasHPPUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AktivitasHPP
     */
    select?: AktivitasHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AktivitasHPP
     */
    omit?: AktivitasHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AktivitasHPPInclude<ExtArgs> | null
    /**
     * The data needed to update a AktivitasHPP.
     */
    data: XOR<AktivitasHPPUpdateInput, AktivitasHPPUncheckedUpdateInput>
    /**
     * Choose, which AktivitasHPP to update.
     */
    where: AktivitasHPPWhereUniqueInput
  }

  /**
   * AktivitasHPP updateMany
   */
  export type AktivitasHPPUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AktivitasHPPS.
     */
    data: XOR<AktivitasHPPUpdateManyMutationInput, AktivitasHPPUncheckedUpdateManyInput>
    /**
     * Filter which AktivitasHPPS to update
     */
    where?: AktivitasHPPWhereInput
    /**
     * Limit how many AktivitasHPPS to update.
     */
    limit?: number
  }

  /**
   * AktivitasHPP updateManyAndReturn
   */
  export type AktivitasHPPUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AktivitasHPP
     */
    select?: AktivitasHPPSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AktivitasHPP
     */
    omit?: AktivitasHPPOmit<ExtArgs> | null
    /**
     * The data used to update AktivitasHPPS.
     */
    data: XOR<AktivitasHPPUpdateManyMutationInput, AktivitasHPPUncheckedUpdateManyInput>
    /**
     * Filter which AktivitasHPPS to update
     */
    where?: AktivitasHPPWhereInput
    /**
     * Limit how many AktivitasHPPS to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AktivitasHPPIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AktivitasHPP upsert
   */
  export type AktivitasHPPUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AktivitasHPP
     */
    select?: AktivitasHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AktivitasHPP
     */
    omit?: AktivitasHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AktivitasHPPInclude<ExtArgs> | null
    /**
     * The filter to search for the AktivitasHPP to update in case it exists.
     */
    where: AktivitasHPPWhereUniqueInput
    /**
     * In case the AktivitasHPP found by the `where` argument doesn't exist, create a new AktivitasHPP with this data.
     */
    create: XOR<AktivitasHPPCreateInput, AktivitasHPPUncheckedCreateInput>
    /**
     * In case the AktivitasHPP was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AktivitasHPPUpdateInput, AktivitasHPPUncheckedUpdateInput>
  }

  /**
   * AktivitasHPP delete
   */
  export type AktivitasHPPDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AktivitasHPP
     */
    select?: AktivitasHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AktivitasHPP
     */
    omit?: AktivitasHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AktivitasHPPInclude<ExtArgs> | null
    /**
     * Filter which AktivitasHPP to delete.
     */
    where: AktivitasHPPWhereUniqueInput
  }

  /**
   * AktivitasHPP deleteMany
   */
  export type AktivitasHPPDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AktivitasHPPS to delete
     */
    where?: AktivitasHPPWhereInput
    /**
     * Limit how many AktivitasHPPS to delete.
     */
    limit?: number
  }

  /**
   * AktivitasHPP.masterSheet
   */
  export type AktivitasHPP$masterSheetArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MasterSheet
     */
    select?: MasterSheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MasterSheet
     */
    omit?: MasterSheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MasterSheetInclude<ExtArgs> | null
    where?: MasterSheetWhereInput
  }

  /**
   * AktivitasHPP without action
   */
  export type AktivitasHPPDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AktivitasHPP
     */
    select?: AktivitasHPPSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AktivitasHPP
     */
    omit?: AktivitasHPPOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AktivitasHPPInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const MasterSheetScalarFieldEnum: {
    idMaster: 'idMaster',
    lokasi: 'lokasi',
    wilayah: 'wilayah',
    jenisBibit: 'jenisBibit',
    kelasBibit: 'kelasBibit',
    status: 'status',
    tanggalRawat: 'tanggalRawat',
    tanggalTanam: 'tanggalTanam',
    tanggalForcingStandard: 'tanggalForcingStandard',
    tanggalRenForcing: 'tanggalRenForcing',
    tanggalRealForcing: 'tanggalRealForcing',
    tanggalSelesaiPanen: 'tanggalSelesaiPanen',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MasterSheetScalarFieldEnum = (typeof MasterSheetScalarFieldEnum)[keyof typeof MasterSheetScalarFieldEnum]


  export const BudgetScalarFieldEnum: {
    idBudget: 'idBudget',
    group: 'group',
    status: 'status',
    periode: 'periode',
    budget: 'budget',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BudgetScalarFieldEnum = (typeof BudgetScalarFieldEnum)[keyof typeof BudgetScalarFieldEnum]


  export const LokasiHPPScalarFieldEnum: {
    idLokasiHpp: 'idLokasiHpp',
    idMaster: 'idMaster',
    lokasi: 'lokasi',
    idBudget: 'idBudget',
    periode: 'periode',
    tahun: 'tahun',
    tanggalRawat: 'tanggalRawat',
    status: 'status',
    jenisBibit: 'jenisBibit',
    kelasBibit: 'kelasBibit',
    qtyPanen: 'qtyPanen',
    luasPanen: 'luasPanen',
    luasAktif: 'luasAktif',
    group: 'group',
    descGroup: 'descGroup',
    jenisBiaya: 'jenisBiaya',
    biaya: 'biaya',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type LokasiHPPScalarFieldEnum = (typeof LokasiHPPScalarFieldEnum)[keyof typeof LokasiHPPScalarFieldEnum]


  export const AktivitasHPPScalarFieldEnum: {
    idAktivitas: 'idAktivitas',
    idMaster: 'idMaster',
    lokasi: 'lokasi',
    tanggalMulaiRawat: 'tanggalMulaiRawat',
    tanggalMulaiTanam: 'tanggalMulaiTanam',
    tanggalForcingStandard: 'tanggalForcingStandard',
    rencanaForcing: 'rencanaForcing',
    realForcing: 'realForcing',
    rencanaPanen: 'rencanaPanen',
    aktivitas: 'aktivitas',
    biaya: 'biaya',
    hasil: 'hasil',
    uom: 'uom',
    group: 'group',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AktivitasHPPScalarFieldEnum = (typeof AktivitasHPPScalarFieldEnum)[keyof typeof AktivitasHPPScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type MasterSheetWhereInput = {
    AND?: MasterSheetWhereInput | MasterSheetWhereInput[]
    OR?: MasterSheetWhereInput[]
    NOT?: MasterSheetWhereInput | MasterSheetWhereInput[]
    idMaster?: StringFilter<"MasterSheet"> | string
    lokasi?: StringFilter<"MasterSheet"> | string
    wilayah?: StringFilter<"MasterSheet"> | string
    jenisBibit?: StringFilter<"MasterSheet"> | string
    kelasBibit?: StringFilter<"MasterSheet"> | string
    status?: StringFilter<"MasterSheet"> | string
    tanggalRawat?: DateTimeFilter<"MasterSheet"> | Date | string
    tanggalTanam?: DateTimeNullableFilter<"MasterSheet"> | Date | string | null
    tanggalForcingStandard?: DateTimeNullableFilter<"MasterSheet"> | Date | string | null
    tanggalRenForcing?: DateTimeNullableFilter<"MasterSheet"> | Date | string | null
    tanggalRealForcing?: DateTimeNullableFilter<"MasterSheet"> | Date | string | null
    tanggalSelesaiPanen?: DateTimeNullableFilter<"MasterSheet"> | Date | string | null
    createdAt?: DateTimeFilter<"MasterSheet"> | Date | string
    updatedAt?: DateTimeFilter<"MasterSheet"> | Date | string
    lokasiHppList?: LokasiHPPListRelationFilter
    aktivitasHppList?: AktivitasHPPListRelationFilter
  }

  export type MasterSheetOrderByWithRelationInput = {
    idMaster?: SortOrder
    lokasi?: SortOrder
    wilayah?: SortOrder
    jenisBibit?: SortOrder
    kelasBibit?: SortOrder
    status?: SortOrder
    tanggalRawat?: SortOrder
    tanggalTanam?: SortOrderInput | SortOrder
    tanggalForcingStandard?: SortOrderInput | SortOrder
    tanggalRenForcing?: SortOrderInput | SortOrder
    tanggalRealForcing?: SortOrderInput | SortOrder
    tanggalSelesaiPanen?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lokasiHppList?: LokasiHPPOrderByRelationAggregateInput
    aktivitasHppList?: AktivitasHPPOrderByRelationAggregateInput
  }

  export type MasterSheetWhereUniqueInput = Prisma.AtLeast<{
    idMaster?: string
    AND?: MasterSheetWhereInput | MasterSheetWhereInput[]
    OR?: MasterSheetWhereInput[]
    NOT?: MasterSheetWhereInput | MasterSheetWhereInput[]
    lokasi?: StringFilter<"MasterSheet"> | string
    wilayah?: StringFilter<"MasterSheet"> | string
    jenisBibit?: StringFilter<"MasterSheet"> | string
    kelasBibit?: StringFilter<"MasterSheet"> | string
    status?: StringFilter<"MasterSheet"> | string
    tanggalRawat?: DateTimeFilter<"MasterSheet"> | Date | string
    tanggalTanam?: DateTimeNullableFilter<"MasterSheet"> | Date | string | null
    tanggalForcingStandard?: DateTimeNullableFilter<"MasterSheet"> | Date | string | null
    tanggalRenForcing?: DateTimeNullableFilter<"MasterSheet"> | Date | string | null
    tanggalRealForcing?: DateTimeNullableFilter<"MasterSheet"> | Date | string | null
    tanggalSelesaiPanen?: DateTimeNullableFilter<"MasterSheet"> | Date | string | null
    createdAt?: DateTimeFilter<"MasterSheet"> | Date | string
    updatedAt?: DateTimeFilter<"MasterSheet"> | Date | string
    lokasiHppList?: LokasiHPPListRelationFilter
    aktivitasHppList?: AktivitasHPPListRelationFilter
  }, "idMaster">

  export type MasterSheetOrderByWithAggregationInput = {
    idMaster?: SortOrder
    lokasi?: SortOrder
    wilayah?: SortOrder
    jenisBibit?: SortOrder
    kelasBibit?: SortOrder
    status?: SortOrder
    tanggalRawat?: SortOrder
    tanggalTanam?: SortOrderInput | SortOrder
    tanggalForcingStandard?: SortOrderInput | SortOrder
    tanggalRenForcing?: SortOrderInput | SortOrder
    tanggalRealForcing?: SortOrderInput | SortOrder
    tanggalSelesaiPanen?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MasterSheetCountOrderByAggregateInput
    _max?: MasterSheetMaxOrderByAggregateInput
    _min?: MasterSheetMinOrderByAggregateInput
  }

  export type MasterSheetScalarWhereWithAggregatesInput = {
    AND?: MasterSheetScalarWhereWithAggregatesInput | MasterSheetScalarWhereWithAggregatesInput[]
    OR?: MasterSheetScalarWhereWithAggregatesInput[]
    NOT?: MasterSheetScalarWhereWithAggregatesInput | MasterSheetScalarWhereWithAggregatesInput[]
    idMaster?: StringWithAggregatesFilter<"MasterSheet"> | string
    lokasi?: StringWithAggregatesFilter<"MasterSheet"> | string
    wilayah?: StringWithAggregatesFilter<"MasterSheet"> | string
    jenisBibit?: StringWithAggregatesFilter<"MasterSheet"> | string
    kelasBibit?: StringWithAggregatesFilter<"MasterSheet"> | string
    status?: StringWithAggregatesFilter<"MasterSheet"> | string
    tanggalRawat?: DateTimeWithAggregatesFilter<"MasterSheet"> | Date | string
    tanggalTanam?: DateTimeNullableWithAggregatesFilter<"MasterSheet"> | Date | string | null
    tanggalForcingStandard?: DateTimeNullableWithAggregatesFilter<"MasterSheet"> | Date | string | null
    tanggalRenForcing?: DateTimeNullableWithAggregatesFilter<"MasterSheet"> | Date | string | null
    tanggalRealForcing?: DateTimeNullableWithAggregatesFilter<"MasterSheet"> | Date | string | null
    tanggalSelesaiPanen?: DateTimeNullableWithAggregatesFilter<"MasterSheet"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MasterSheet"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MasterSheet"> | Date | string
  }

  export type BudgetWhereInput = {
    AND?: BudgetWhereInput | BudgetWhereInput[]
    OR?: BudgetWhereInput[]
    NOT?: BudgetWhereInput | BudgetWhereInput[]
    idBudget?: StringFilter<"Budget"> | string
    group?: StringFilter<"Budget"> | string
    status?: StringFilter<"Budget"> | string
    periode?: IntFilter<"Budget"> | number
    budget?: DecimalFilter<"Budget"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"Budget"> | Date | string
    updatedAt?: DateTimeFilter<"Budget"> | Date | string
    lokasiHppList?: LokasiHPPListRelationFilter
  }

  export type BudgetOrderByWithRelationInput = {
    idBudget?: SortOrder
    group?: SortOrder
    status?: SortOrder
    periode?: SortOrder
    budget?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lokasiHppList?: LokasiHPPOrderByRelationAggregateInput
  }

  export type BudgetWhereUniqueInput = Prisma.AtLeast<{
    idBudget?: string
    AND?: BudgetWhereInput | BudgetWhereInput[]
    OR?: BudgetWhereInput[]
    NOT?: BudgetWhereInput | BudgetWhereInput[]
    group?: StringFilter<"Budget"> | string
    status?: StringFilter<"Budget"> | string
    periode?: IntFilter<"Budget"> | number
    budget?: DecimalFilter<"Budget"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"Budget"> | Date | string
    updatedAt?: DateTimeFilter<"Budget"> | Date | string
    lokasiHppList?: LokasiHPPListRelationFilter
  }, "idBudget">

  export type BudgetOrderByWithAggregationInput = {
    idBudget?: SortOrder
    group?: SortOrder
    status?: SortOrder
    periode?: SortOrder
    budget?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BudgetCountOrderByAggregateInput
    _avg?: BudgetAvgOrderByAggregateInput
    _max?: BudgetMaxOrderByAggregateInput
    _min?: BudgetMinOrderByAggregateInput
    _sum?: BudgetSumOrderByAggregateInput
  }

  export type BudgetScalarWhereWithAggregatesInput = {
    AND?: BudgetScalarWhereWithAggregatesInput | BudgetScalarWhereWithAggregatesInput[]
    OR?: BudgetScalarWhereWithAggregatesInput[]
    NOT?: BudgetScalarWhereWithAggregatesInput | BudgetScalarWhereWithAggregatesInput[]
    idBudget?: StringWithAggregatesFilter<"Budget"> | string
    group?: StringWithAggregatesFilter<"Budget"> | string
    status?: StringWithAggregatesFilter<"Budget"> | string
    periode?: IntWithAggregatesFilter<"Budget"> | number
    budget?: DecimalWithAggregatesFilter<"Budget"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"Budget"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Budget"> | Date | string
  }

  export type LokasiHPPWhereInput = {
    AND?: LokasiHPPWhereInput | LokasiHPPWhereInput[]
    OR?: LokasiHPPWhereInput[]
    NOT?: LokasiHPPWhereInput | LokasiHPPWhereInput[]
    idLokasiHpp?: StringFilter<"LokasiHPP"> | string
    idMaster?: StringNullableFilter<"LokasiHPP"> | string | null
    lokasi?: StringFilter<"LokasiHPP"> | string
    idBudget?: StringFilter<"LokasiHPP"> | string
    periode?: IntFilter<"LokasiHPP"> | number
    tahun?: IntNullableFilter<"LokasiHPP"> | number | null
    tanggalRawat?: DateTimeNullableFilter<"LokasiHPP"> | Date | string | null
    status?: StringFilter<"LokasiHPP"> | string
    jenisBibit?: StringNullableFilter<"LokasiHPP"> | string | null
    kelasBibit?: StringNullableFilter<"LokasiHPP"> | string | null
    qtyPanen?: DecimalFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    group?: StringFilter<"LokasiHPP"> | string
    descGroup?: StringFilter<"LokasiHPP"> | string
    jenisBiaya?: StringFilter<"LokasiHPP"> | string
    biaya?: DecimalFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"LokasiHPP"> | Date | string
    updatedAt?: DateTimeFilter<"LokasiHPP"> | Date | string
    masterSheet?: XOR<MasterSheetNullableScalarRelationFilter, MasterSheetWhereInput> | null
    budgetItem?: XOR<BudgetScalarRelationFilter, BudgetWhereInput>
  }

  export type LokasiHPPOrderByWithRelationInput = {
    idLokasiHpp?: SortOrder
    idMaster?: SortOrderInput | SortOrder
    lokasi?: SortOrder
    idBudget?: SortOrder
    periode?: SortOrder
    tahun?: SortOrderInput | SortOrder
    tanggalRawat?: SortOrderInput | SortOrder
    status?: SortOrder
    jenisBibit?: SortOrderInput | SortOrder
    kelasBibit?: SortOrderInput | SortOrder
    qtyPanen?: SortOrder
    luasPanen?: SortOrder
    luasAktif?: SortOrder
    group?: SortOrder
    descGroup?: SortOrder
    jenisBiaya?: SortOrder
    biaya?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    masterSheet?: MasterSheetOrderByWithRelationInput
    budgetItem?: BudgetOrderByWithRelationInput
  }

  export type LokasiHPPWhereUniqueInput = Prisma.AtLeast<{
    idLokasiHpp?: string
    AND?: LokasiHPPWhereInput | LokasiHPPWhereInput[]
    OR?: LokasiHPPWhereInput[]
    NOT?: LokasiHPPWhereInput | LokasiHPPWhereInput[]
    idMaster?: StringNullableFilter<"LokasiHPP"> | string | null
    lokasi?: StringFilter<"LokasiHPP"> | string
    idBudget?: StringFilter<"LokasiHPP"> | string
    periode?: IntFilter<"LokasiHPP"> | number
    tahun?: IntNullableFilter<"LokasiHPP"> | number | null
    tanggalRawat?: DateTimeNullableFilter<"LokasiHPP"> | Date | string | null
    status?: StringFilter<"LokasiHPP"> | string
    jenisBibit?: StringNullableFilter<"LokasiHPP"> | string | null
    kelasBibit?: StringNullableFilter<"LokasiHPP"> | string | null
    qtyPanen?: DecimalFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    group?: StringFilter<"LokasiHPP"> | string
    descGroup?: StringFilter<"LokasiHPP"> | string
    jenisBiaya?: StringFilter<"LokasiHPP"> | string
    biaya?: DecimalFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"LokasiHPP"> | Date | string
    updatedAt?: DateTimeFilter<"LokasiHPP"> | Date | string
    masterSheet?: XOR<MasterSheetNullableScalarRelationFilter, MasterSheetWhereInput> | null
    budgetItem?: XOR<BudgetScalarRelationFilter, BudgetWhereInput>
  }, "idLokasiHpp">

  export type LokasiHPPOrderByWithAggregationInput = {
    idLokasiHpp?: SortOrder
    idMaster?: SortOrderInput | SortOrder
    lokasi?: SortOrder
    idBudget?: SortOrder
    periode?: SortOrder
    tahun?: SortOrderInput | SortOrder
    tanggalRawat?: SortOrderInput | SortOrder
    status?: SortOrder
    jenisBibit?: SortOrderInput | SortOrder
    kelasBibit?: SortOrderInput | SortOrder
    qtyPanen?: SortOrder
    luasPanen?: SortOrder
    luasAktif?: SortOrder
    group?: SortOrder
    descGroup?: SortOrder
    jenisBiaya?: SortOrder
    biaya?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: LokasiHPPCountOrderByAggregateInput
    _avg?: LokasiHPPAvgOrderByAggregateInput
    _max?: LokasiHPPMaxOrderByAggregateInput
    _min?: LokasiHPPMinOrderByAggregateInput
    _sum?: LokasiHPPSumOrderByAggregateInput
  }

  export type LokasiHPPScalarWhereWithAggregatesInput = {
    AND?: LokasiHPPScalarWhereWithAggregatesInput | LokasiHPPScalarWhereWithAggregatesInput[]
    OR?: LokasiHPPScalarWhereWithAggregatesInput[]
    NOT?: LokasiHPPScalarWhereWithAggregatesInput | LokasiHPPScalarWhereWithAggregatesInput[]
    idLokasiHpp?: StringWithAggregatesFilter<"LokasiHPP"> | string
    idMaster?: StringNullableWithAggregatesFilter<"LokasiHPP"> | string | null
    lokasi?: StringWithAggregatesFilter<"LokasiHPP"> | string
    idBudget?: StringWithAggregatesFilter<"LokasiHPP"> | string
    periode?: IntWithAggregatesFilter<"LokasiHPP"> | number
    tahun?: IntNullableWithAggregatesFilter<"LokasiHPP"> | number | null
    tanggalRawat?: DateTimeNullableWithAggregatesFilter<"LokasiHPP"> | Date | string | null
    status?: StringWithAggregatesFilter<"LokasiHPP"> | string
    jenisBibit?: StringNullableWithAggregatesFilter<"LokasiHPP"> | string | null
    kelasBibit?: StringNullableWithAggregatesFilter<"LokasiHPP"> | string | null
    qtyPanen?: DecimalWithAggregatesFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalWithAggregatesFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalWithAggregatesFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    group?: StringWithAggregatesFilter<"LokasiHPP"> | string
    descGroup?: StringWithAggregatesFilter<"LokasiHPP"> | string
    jenisBiaya?: StringWithAggregatesFilter<"LokasiHPP"> | string
    biaya?: DecimalWithAggregatesFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"LokasiHPP"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LokasiHPP"> | Date | string
  }

  export type AktivitasHPPWhereInput = {
    AND?: AktivitasHPPWhereInput | AktivitasHPPWhereInput[]
    OR?: AktivitasHPPWhereInput[]
    NOT?: AktivitasHPPWhereInput | AktivitasHPPWhereInput[]
    idAktivitas?: StringFilter<"AktivitasHPP"> | string
    idMaster?: StringNullableFilter<"AktivitasHPP"> | string | null
    lokasi?: StringFilter<"AktivitasHPP"> | string
    tanggalMulaiRawat?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    tanggalMulaiTanam?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    tanggalForcingStandard?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    rencanaForcing?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    realForcing?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    rencanaPanen?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    aktivitas?: StringFilter<"AktivitasHPP"> | string
    biaya?: DecimalFilter<"AktivitasHPP"> | Decimal | DecimalJsLike | number | string
    hasil?: DecimalFilter<"AktivitasHPP"> | Decimal | DecimalJsLike | number | string
    uom?: StringFilter<"AktivitasHPP"> | string
    group?: StringFilter<"AktivitasHPP"> | string
    createdAt?: DateTimeFilter<"AktivitasHPP"> | Date | string
    updatedAt?: DateTimeFilter<"AktivitasHPP"> | Date | string
    masterSheet?: XOR<MasterSheetNullableScalarRelationFilter, MasterSheetWhereInput> | null
  }

  export type AktivitasHPPOrderByWithRelationInput = {
    idAktivitas?: SortOrder
    idMaster?: SortOrderInput | SortOrder
    lokasi?: SortOrder
    tanggalMulaiRawat?: SortOrderInput | SortOrder
    tanggalMulaiTanam?: SortOrderInput | SortOrder
    tanggalForcingStandard?: SortOrderInput | SortOrder
    rencanaForcing?: SortOrderInput | SortOrder
    realForcing?: SortOrderInput | SortOrder
    rencanaPanen?: SortOrderInput | SortOrder
    aktivitas?: SortOrder
    biaya?: SortOrder
    hasil?: SortOrder
    uom?: SortOrder
    group?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    masterSheet?: MasterSheetOrderByWithRelationInput
  }

  export type AktivitasHPPWhereUniqueInput = Prisma.AtLeast<{
    idAktivitas?: string
    AND?: AktivitasHPPWhereInput | AktivitasHPPWhereInput[]
    OR?: AktivitasHPPWhereInput[]
    NOT?: AktivitasHPPWhereInput | AktivitasHPPWhereInput[]
    idMaster?: StringNullableFilter<"AktivitasHPP"> | string | null
    lokasi?: StringFilter<"AktivitasHPP"> | string
    tanggalMulaiRawat?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    tanggalMulaiTanam?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    tanggalForcingStandard?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    rencanaForcing?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    realForcing?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    rencanaPanen?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    aktivitas?: StringFilter<"AktivitasHPP"> | string
    biaya?: DecimalFilter<"AktivitasHPP"> | Decimal | DecimalJsLike | number | string
    hasil?: DecimalFilter<"AktivitasHPP"> | Decimal | DecimalJsLike | number | string
    uom?: StringFilter<"AktivitasHPP"> | string
    group?: StringFilter<"AktivitasHPP"> | string
    createdAt?: DateTimeFilter<"AktivitasHPP"> | Date | string
    updatedAt?: DateTimeFilter<"AktivitasHPP"> | Date | string
    masterSheet?: XOR<MasterSheetNullableScalarRelationFilter, MasterSheetWhereInput> | null
  }, "idAktivitas">

  export type AktivitasHPPOrderByWithAggregationInput = {
    idAktivitas?: SortOrder
    idMaster?: SortOrderInput | SortOrder
    lokasi?: SortOrder
    tanggalMulaiRawat?: SortOrderInput | SortOrder
    tanggalMulaiTanam?: SortOrderInput | SortOrder
    tanggalForcingStandard?: SortOrderInput | SortOrder
    rencanaForcing?: SortOrderInput | SortOrder
    realForcing?: SortOrderInput | SortOrder
    rencanaPanen?: SortOrderInput | SortOrder
    aktivitas?: SortOrder
    biaya?: SortOrder
    hasil?: SortOrder
    uom?: SortOrder
    group?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AktivitasHPPCountOrderByAggregateInput
    _avg?: AktivitasHPPAvgOrderByAggregateInput
    _max?: AktivitasHPPMaxOrderByAggregateInput
    _min?: AktivitasHPPMinOrderByAggregateInput
    _sum?: AktivitasHPPSumOrderByAggregateInput
  }

  export type AktivitasHPPScalarWhereWithAggregatesInput = {
    AND?: AktivitasHPPScalarWhereWithAggregatesInput | AktivitasHPPScalarWhereWithAggregatesInput[]
    OR?: AktivitasHPPScalarWhereWithAggregatesInput[]
    NOT?: AktivitasHPPScalarWhereWithAggregatesInput | AktivitasHPPScalarWhereWithAggregatesInput[]
    idAktivitas?: StringWithAggregatesFilter<"AktivitasHPP"> | string
    idMaster?: StringNullableWithAggregatesFilter<"AktivitasHPP"> | string | null
    lokasi?: StringWithAggregatesFilter<"AktivitasHPP"> | string
    tanggalMulaiRawat?: DateTimeNullableWithAggregatesFilter<"AktivitasHPP"> | Date | string | null
    tanggalMulaiTanam?: DateTimeNullableWithAggregatesFilter<"AktivitasHPP"> | Date | string | null
    tanggalForcingStandard?: DateTimeNullableWithAggregatesFilter<"AktivitasHPP"> | Date | string | null
    rencanaForcing?: DateTimeNullableWithAggregatesFilter<"AktivitasHPP"> | Date | string | null
    realForcing?: DateTimeNullableWithAggregatesFilter<"AktivitasHPP"> | Date | string | null
    rencanaPanen?: DateTimeNullableWithAggregatesFilter<"AktivitasHPP"> | Date | string | null
    aktivitas?: StringWithAggregatesFilter<"AktivitasHPP"> | string
    biaya?: DecimalWithAggregatesFilter<"AktivitasHPP"> | Decimal | DecimalJsLike | number | string
    hasil?: DecimalWithAggregatesFilter<"AktivitasHPP"> | Decimal | DecimalJsLike | number | string
    uom?: StringWithAggregatesFilter<"AktivitasHPP"> | string
    group?: StringWithAggregatesFilter<"AktivitasHPP"> | string
    createdAt?: DateTimeWithAggregatesFilter<"AktivitasHPP"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AktivitasHPP"> | Date | string
  }

  export type MasterSheetCreateInput = {
    idMaster: string
    lokasi: string
    wilayah: string
    jenisBibit: string
    kelasBibit: string
    status?: string
    tanggalRawat: Date | string
    tanggalTanam?: Date | string | null
    tanggalForcingStandard?: Date | string | null
    tanggalRenForcing?: Date | string | null
    tanggalRealForcing?: Date | string | null
    tanggalSelesaiPanen?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lokasiHppList?: LokasiHPPCreateNestedManyWithoutMasterSheetInput
    aktivitasHppList?: AktivitasHPPCreateNestedManyWithoutMasterSheetInput
  }

  export type MasterSheetUncheckedCreateInput = {
    idMaster: string
    lokasi: string
    wilayah: string
    jenisBibit: string
    kelasBibit: string
    status?: string
    tanggalRawat: Date | string
    tanggalTanam?: Date | string | null
    tanggalForcingStandard?: Date | string | null
    tanggalRenForcing?: Date | string | null
    tanggalRealForcing?: Date | string | null
    tanggalSelesaiPanen?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lokasiHppList?: LokasiHPPUncheckedCreateNestedManyWithoutMasterSheetInput
    aktivitasHppList?: AktivitasHPPUncheckedCreateNestedManyWithoutMasterSheetInput
  }

  export type MasterSheetUpdateInput = {
    idMaster?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    wilayah?: StringFieldUpdateOperationsInput | string
    jenisBibit?: StringFieldUpdateOperationsInput | string
    kelasBibit?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    tanggalRawat?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggalTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRenForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRealForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalSelesaiPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lokasiHppList?: LokasiHPPUpdateManyWithoutMasterSheetNestedInput
    aktivitasHppList?: AktivitasHPPUpdateManyWithoutMasterSheetNestedInput
  }

  export type MasterSheetUncheckedUpdateInput = {
    idMaster?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    wilayah?: StringFieldUpdateOperationsInput | string
    jenisBibit?: StringFieldUpdateOperationsInput | string
    kelasBibit?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    tanggalRawat?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggalTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRenForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRealForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalSelesaiPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lokasiHppList?: LokasiHPPUncheckedUpdateManyWithoutMasterSheetNestedInput
    aktivitasHppList?: AktivitasHPPUncheckedUpdateManyWithoutMasterSheetNestedInput
  }

  export type MasterSheetCreateManyInput = {
    idMaster: string
    lokasi: string
    wilayah: string
    jenisBibit: string
    kelasBibit: string
    status?: string
    tanggalRawat: Date | string
    tanggalTanam?: Date | string | null
    tanggalForcingStandard?: Date | string | null
    tanggalRenForcing?: Date | string | null
    tanggalRealForcing?: Date | string | null
    tanggalSelesaiPanen?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MasterSheetUpdateManyMutationInput = {
    idMaster?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    wilayah?: StringFieldUpdateOperationsInput | string
    jenisBibit?: StringFieldUpdateOperationsInput | string
    kelasBibit?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    tanggalRawat?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggalTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRenForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRealForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalSelesaiPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MasterSheetUncheckedUpdateManyInput = {
    idMaster?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    wilayah?: StringFieldUpdateOperationsInput | string
    jenisBibit?: StringFieldUpdateOperationsInput | string
    kelasBibit?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    tanggalRawat?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggalTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRenForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRealForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalSelesaiPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BudgetCreateInput = {
    idBudget: string
    group: string
    status: string
    periode: number
    budget: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    lokasiHppList?: LokasiHPPCreateNestedManyWithoutBudgetItemInput
  }

  export type BudgetUncheckedCreateInput = {
    idBudget: string
    group: string
    status: string
    periode: number
    budget: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    lokasiHppList?: LokasiHPPUncheckedCreateNestedManyWithoutBudgetItemInput
  }

  export type BudgetUpdateInput = {
    idBudget?: StringFieldUpdateOperationsInput | string
    group?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    budget?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lokasiHppList?: LokasiHPPUpdateManyWithoutBudgetItemNestedInput
  }

  export type BudgetUncheckedUpdateInput = {
    idBudget?: StringFieldUpdateOperationsInput | string
    group?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    budget?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lokasiHppList?: LokasiHPPUncheckedUpdateManyWithoutBudgetItemNestedInput
  }

  export type BudgetCreateManyInput = {
    idBudget: string
    group: string
    status: string
    periode: number
    budget: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BudgetUpdateManyMutationInput = {
    idBudget?: StringFieldUpdateOperationsInput | string
    group?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    budget?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BudgetUncheckedUpdateManyInput = {
    idBudget?: StringFieldUpdateOperationsInput | string
    group?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    budget?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LokasiHPPCreateInput = {
    idLokasiHpp: string
    lokasi: string
    periode: number
    tahun?: number | null
    tanggalRawat?: Date | string | null
    status: string
    jenisBibit?: string | null
    kelasBibit?: string | null
    qtyPanen: Decimal | DecimalJsLike | number | string
    luasPanen: Decimal | DecimalJsLike | number | string
    luasAktif: Decimal | DecimalJsLike | number | string
    group: string
    descGroup: string
    jenisBiaya: string
    biaya: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    masterSheet?: MasterSheetCreateNestedOneWithoutLokasiHppListInput
    budgetItem: BudgetCreateNestedOneWithoutLokasiHppListInput
  }

  export type LokasiHPPUncheckedCreateInput = {
    idLokasiHpp: string
    idMaster?: string | null
    lokasi: string
    idBudget: string
    periode: number
    tahun?: number | null
    tanggalRawat?: Date | string | null
    status: string
    jenisBibit?: string | null
    kelasBibit?: string | null
    qtyPanen: Decimal | DecimalJsLike | number | string
    luasPanen: Decimal | DecimalJsLike | number | string
    luasAktif: Decimal | DecimalJsLike | number | string
    group: string
    descGroup: string
    jenisBiaya: string
    biaya: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LokasiHPPUpdateInput = {
    idLokasiHpp?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    tahun?: NullableIntFieldUpdateOperationsInput | number | null
    tanggalRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: StringFieldUpdateOperationsInput | string
    jenisBibit?: NullableStringFieldUpdateOperationsInput | string | null
    kelasBibit?: NullableStringFieldUpdateOperationsInput | string | null
    qtyPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    group?: StringFieldUpdateOperationsInput | string
    descGroup?: StringFieldUpdateOperationsInput | string
    jenisBiaya?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    masterSheet?: MasterSheetUpdateOneWithoutLokasiHppListNestedInput
    budgetItem?: BudgetUpdateOneRequiredWithoutLokasiHppListNestedInput
  }

  export type LokasiHPPUncheckedUpdateInput = {
    idLokasiHpp?: StringFieldUpdateOperationsInput | string
    idMaster?: NullableStringFieldUpdateOperationsInput | string | null
    lokasi?: StringFieldUpdateOperationsInput | string
    idBudget?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    tahun?: NullableIntFieldUpdateOperationsInput | number | null
    tanggalRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: StringFieldUpdateOperationsInput | string
    jenisBibit?: NullableStringFieldUpdateOperationsInput | string | null
    kelasBibit?: NullableStringFieldUpdateOperationsInput | string | null
    qtyPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    group?: StringFieldUpdateOperationsInput | string
    descGroup?: StringFieldUpdateOperationsInput | string
    jenisBiaya?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LokasiHPPCreateManyInput = {
    idLokasiHpp: string
    idMaster?: string | null
    lokasi: string
    idBudget: string
    periode: number
    tahun?: number | null
    tanggalRawat?: Date | string | null
    status: string
    jenisBibit?: string | null
    kelasBibit?: string | null
    qtyPanen: Decimal | DecimalJsLike | number | string
    luasPanen: Decimal | DecimalJsLike | number | string
    luasAktif: Decimal | DecimalJsLike | number | string
    group: string
    descGroup: string
    jenisBiaya: string
    biaya: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LokasiHPPUpdateManyMutationInput = {
    idLokasiHpp?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    tahun?: NullableIntFieldUpdateOperationsInput | number | null
    tanggalRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: StringFieldUpdateOperationsInput | string
    jenisBibit?: NullableStringFieldUpdateOperationsInput | string | null
    kelasBibit?: NullableStringFieldUpdateOperationsInput | string | null
    qtyPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    group?: StringFieldUpdateOperationsInput | string
    descGroup?: StringFieldUpdateOperationsInput | string
    jenisBiaya?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LokasiHPPUncheckedUpdateManyInput = {
    idLokasiHpp?: StringFieldUpdateOperationsInput | string
    idMaster?: NullableStringFieldUpdateOperationsInput | string | null
    lokasi?: StringFieldUpdateOperationsInput | string
    idBudget?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    tahun?: NullableIntFieldUpdateOperationsInput | number | null
    tanggalRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: StringFieldUpdateOperationsInput | string
    jenisBibit?: NullableStringFieldUpdateOperationsInput | string | null
    kelasBibit?: NullableStringFieldUpdateOperationsInput | string | null
    qtyPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    group?: StringFieldUpdateOperationsInput | string
    descGroup?: StringFieldUpdateOperationsInput | string
    jenisBiaya?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AktivitasHPPCreateInput = {
    idAktivitas: string
    lokasi: string
    tanggalMulaiRawat?: Date | string | null
    tanggalMulaiTanam?: Date | string | null
    tanggalForcingStandard?: Date | string | null
    rencanaForcing?: Date | string | null
    realForcing?: Date | string | null
    rencanaPanen?: Date | string | null
    aktivitas: string
    biaya: Decimal | DecimalJsLike | number | string
    hasil: Decimal | DecimalJsLike | number | string
    uom: string
    group: string
    createdAt?: Date | string
    updatedAt?: Date | string
    masterSheet?: MasterSheetCreateNestedOneWithoutAktivitasHppListInput
  }

  export type AktivitasHPPUncheckedCreateInput = {
    idAktivitas: string
    idMaster?: string | null
    lokasi: string
    tanggalMulaiRawat?: Date | string | null
    tanggalMulaiTanam?: Date | string | null
    tanggalForcingStandard?: Date | string | null
    rencanaForcing?: Date | string | null
    realForcing?: Date | string | null
    rencanaPanen?: Date | string | null
    aktivitas: string
    biaya: Decimal | DecimalJsLike | number | string
    hasil: Decimal | DecimalJsLike | number | string
    uom: string
    group: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AktivitasHPPUpdateInput = {
    idAktivitas?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    tanggalMulaiRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalMulaiTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    realForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    aktivitas?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    hasil?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    uom?: StringFieldUpdateOperationsInput | string
    group?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    masterSheet?: MasterSheetUpdateOneWithoutAktivitasHppListNestedInput
  }

  export type AktivitasHPPUncheckedUpdateInput = {
    idAktivitas?: StringFieldUpdateOperationsInput | string
    idMaster?: NullableStringFieldUpdateOperationsInput | string | null
    lokasi?: StringFieldUpdateOperationsInput | string
    tanggalMulaiRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalMulaiTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    realForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    aktivitas?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    hasil?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    uom?: StringFieldUpdateOperationsInput | string
    group?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AktivitasHPPCreateManyInput = {
    idAktivitas: string
    idMaster?: string | null
    lokasi: string
    tanggalMulaiRawat?: Date | string | null
    tanggalMulaiTanam?: Date | string | null
    tanggalForcingStandard?: Date | string | null
    rencanaForcing?: Date | string | null
    realForcing?: Date | string | null
    rencanaPanen?: Date | string | null
    aktivitas: string
    biaya: Decimal | DecimalJsLike | number | string
    hasil: Decimal | DecimalJsLike | number | string
    uom: string
    group: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AktivitasHPPUpdateManyMutationInput = {
    idAktivitas?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    tanggalMulaiRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalMulaiTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    realForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    aktivitas?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    hasil?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    uom?: StringFieldUpdateOperationsInput | string
    group?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AktivitasHPPUncheckedUpdateManyInput = {
    idAktivitas?: StringFieldUpdateOperationsInput | string
    idMaster?: NullableStringFieldUpdateOperationsInput | string | null
    lokasi?: StringFieldUpdateOperationsInput | string
    tanggalMulaiRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalMulaiTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    realForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    aktivitas?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    hasil?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    uom?: StringFieldUpdateOperationsInput | string
    group?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type LokasiHPPListRelationFilter = {
    every?: LokasiHPPWhereInput
    some?: LokasiHPPWhereInput
    none?: LokasiHPPWhereInput
  }

  export type AktivitasHPPListRelationFilter = {
    every?: AktivitasHPPWhereInput
    some?: AktivitasHPPWhereInput
    none?: AktivitasHPPWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type LokasiHPPOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AktivitasHPPOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MasterSheetCountOrderByAggregateInput = {
    idMaster?: SortOrder
    lokasi?: SortOrder
    wilayah?: SortOrder
    jenisBibit?: SortOrder
    kelasBibit?: SortOrder
    status?: SortOrder
    tanggalRawat?: SortOrder
    tanggalTanam?: SortOrder
    tanggalForcingStandard?: SortOrder
    tanggalRenForcing?: SortOrder
    tanggalRealForcing?: SortOrder
    tanggalSelesaiPanen?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MasterSheetMaxOrderByAggregateInput = {
    idMaster?: SortOrder
    lokasi?: SortOrder
    wilayah?: SortOrder
    jenisBibit?: SortOrder
    kelasBibit?: SortOrder
    status?: SortOrder
    tanggalRawat?: SortOrder
    tanggalTanam?: SortOrder
    tanggalForcingStandard?: SortOrder
    tanggalRenForcing?: SortOrder
    tanggalRealForcing?: SortOrder
    tanggalSelesaiPanen?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MasterSheetMinOrderByAggregateInput = {
    idMaster?: SortOrder
    lokasi?: SortOrder
    wilayah?: SortOrder
    jenisBibit?: SortOrder
    kelasBibit?: SortOrder
    status?: SortOrder
    tanggalRawat?: SortOrder
    tanggalTanam?: SortOrder
    tanggalForcingStandard?: SortOrder
    tanggalRenForcing?: SortOrder
    tanggalRealForcing?: SortOrder
    tanggalSelesaiPanen?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type BudgetCountOrderByAggregateInput = {
    idBudget?: SortOrder
    group?: SortOrder
    status?: SortOrder
    periode?: SortOrder
    budget?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BudgetAvgOrderByAggregateInput = {
    periode?: SortOrder
    budget?: SortOrder
  }

  export type BudgetMaxOrderByAggregateInput = {
    idBudget?: SortOrder
    group?: SortOrder
    status?: SortOrder
    periode?: SortOrder
    budget?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BudgetMinOrderByAggregateInput = {
    idBudget?: SortOrder
    group?: SortOrder
    status?: SortOrder
    periode?: SortOrder
    budget?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BudgetSumOrderByAggregateInput = {
    periode?: SortOrder
    budget?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type MasterSheetNullableScalarRelationFilter = {
    is?: MasterSheetWhereInput | null
    isNot?: MasterSheetWhereInput | null
  }

  export type BudgetScalarRelationFilter = {
    is?: BudgetWhereInput
    isNot?: BudgetWhereInput
  }

  export type LokasiHPPCountOrderByAggregateInput = {
    idLokasiHpp?: SortOrder
    idMaster?: SortOrder
    lokasi?: SortOrder
    idBudget?: SortOrder
    periode?: SortOrder
    tahun?: SortOrder
    tanggalRawat?: SortOrder
    status?: SortOrder
    jenisBibit?: SortOrder
    kelasBibit?: SortOrder
    qtyPanen?: SortOrder
    luasPanen?: SortOrder
    luasAktif?: SortOrder
    group?: SortOrder
    descGroup?: SortOrder
    jenisBiaya?: SortOrder
    biaya?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LokasiHPPAvgOrderByAggregateInput = {
    periode?: SortOrder
    tahun?: SortOrder
    qtyPanen?: SortOrder
    luasPanen?: SortOrder
    luasAktif?: SortOrder
    biaya?: SortOrder
  }

  export type LokasiHPPMaxOrderByAggregateInput = {
    idLokasiHpp?: SortOrder
    idMaster?: SortOrder
    lokasi?: SortOrder
    idBudget?: SortOrder
    periode?: SortOrder
    tahun?: SortOrder
    tanggalRawat?: SortOrder
    status?: SortOrder
    jenisBibit?: SortOrder
    kelasBibit?: SortOrder
    qtyPanen?: SortOrder
    luasPanen?: SortOrder
    luasAktif?: SortOrder
    group?: SortOrder
    descGroup?: SortOrder
    jenisBiaya?: SortOrder
    biaya?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LokasiHPPMinOrderByAggregateInput = {
    idLokasiHpp?: SortOrder
    idMaster?: SortOrder
    lokasi?: SortOrder
    idBudget?: SortOrder
    periode?: SortOrder
    tahun?: SortOrder
    tanggalRawat?: SortOrder
    status?: SortOrder
    jenisBibit?: SortOrder
    kelasBibit?: SortOrder
    qtyPanen?: SortOrder
    luasPanen?: SortOrder
    luasAktif?: SortOrder
    group?: SortOrder
    descGroup?: SortOrder
    jenisBiaya?: SortOrder
    biaya?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LokasiHPPSumOrderByAggregateInput = {
    periode?: SortOrder
    tahun?: SortOrder
    qtyPanen?: SortOrder
    luasPanen?: SortOrder
    luasAktif?: SortOrder
    biaya?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type AktivitasHPPCountOrderByAggregateInput = {
    idAktivitas?: SortOrder
    idMaster?: SortOrder
    lokasi?: SortOrder
    tanggalMulaiRawat?: SortOrder
    tanggalMulaiTanam?: SortOrder
    tanggalForcingStandard?: SortOrder
    rencanaForcing?: SortOrder
    realForcing?: SortOrder
    rencanaPanen?: SortOrder
    aktivitas?: SortOrder
    biaya?: SortOrder
    hasil?: SortOrder
    uom?: SortOrder
    group?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AktivitasHPPAvgOrderByAggregateInput = {
    biaya?: SortOrder
    hasil?: SortOrder
  }

  export type AktivitasHPPMaxOrderByAggregateInput = {
    idAktivitas?: SortOrder
    idMaster?: SortOrder
    lokasi?: SortOrder
    tanggalMulaiRawat?: SortOrder
    tanggalMulaiTanam?: SortOrder
    tanggalForcingStandard?: SortOrder
    rencanaForcing?: SortOrder
    realForcing?: SortOrder
    rencanaPanen?: SortOrder
    aktivitas?: SortOrder
    biaya?: SortOrder
    hasil?: SortOrder
    uom?: SortOrder
    group?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AktivitasHPPMinOrderByAggregateInput = {
    idAktivitas?: SortOrder
    idMaster?: SortOrder
    lokasi?: SortOrder
    tanggalMulaiRawat?: SortOrder
    tanggalMulaiTanam?: SortOrder
    tanggalForcingStandard?: SortOrder
    rencanaForcing?: SortOrder
    realForcing?: SortOrder
    rencanaPanen?: SortOrder
    aktivitas?: SortOrder
    biaya?: SortOrder
    hasil?: SortOrder
    uom?: SortOrder
    group?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AktivitasHPPSumOrderByAggregateInput = {
    biaya?: SortOrder
    hasil?: SortOrder
  }

  export type LokasiHPPCreateNestedManyWithoutMasterSheetInput = {
    create?: XOR<LokasiHPPCreateWithoutMasterSheetInput, LokasiHPPUncheckedCreateWithoutMasterSheetInput> | LokasiHPPCreateWithoutMasterSheetInput[] | LokasiHPPUncheckedCreateWithoutMasterSheetInput[]
    connectOrCreate?: LokasiHPPCreateOrConnectWithoutMasterSheetInput | LokasiHPPCreateOrConnectWithoutMasterSheetInput[]
    createMany?: LokasiHPPCreateManyMasterSheetInputEnvelope
    connect?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
  }

  export type AktivitasHPPCreateNestedManyWithoutMasterSheetInput = {
    create?: XOR<AktivitasHPPCreateWithoutMasterSheetInput, AktivitasHPPUncheckedCreateWithoutMasterSheetInput> | AktivitasHPPCreateWithoutMasterSheetInput[] | AktivitasHPPUncheckedCreateWithoutMasterSheetInput[]
    connectOrCreate?: AktivitasHPPCreateOrConnectWithoutMasterSheetInput | AktivitasHPPCreateOrConnectWithoutMasterSheetInput[]
    createMany?: AktivitasHPPCreateManyMasterSheetInputEnvelope
    connect?: AktivitasHPPWhereUniqueInput | AktivitasHPPWhereUniqueInput[]
  }

  export type LokasiHPPUncheckedCreateNestedManyWithoutMasterSheetInput = {
    create?: XOR<LokasiHPPCreateWithoutMasterSheetInput, LokasiHPPUncheckedCreateWithoutMasterSheetInput> | LokasiHPPCreateWithoutMasterSheetInput[] | LokasiHPPUncheckedCreateWithoutMasterSheetInput[]
    connectOrCreate?: LokasiHPPCreateOrConnectWithoutMasterSheetInput | LokasiHPPCreateOrConnectWithoutMasterSheetInput[]
    createMany?: LokasiHPPCreateManyMasterSheetInputEnvelope
    connect?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
  }

  export type AktivitasHPPUncheckedCreateNestedManyWithoutMasterSheetInput = {
    create?: XOR<AktivitasHPPCreateWithoutMasterSheetInput, AktivitasHPPUncheckedCreateWithoutMasterSheetInput> | AktivitasHPPCreateWithoutMasterSheetInput[] | AktivitasHPPUncheckedCreateWithoutMasterSheetInput[]
    connectOrCreate?: AktivitasHPPCreateOrConnectWithoutMasterSheetInput | AktivitasHPPCreateOrConnectWithoutMasterSheetInput[]
    createMany?: AktivitasHPPCreateManyMasterSheetInputEnvelope
    connect?: AktivitasHPPWhereUniqueInput | AktivitasHPPWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type LokasiHPPUpdateManyWithoutMasterSheetNestedInput = {
    create?: XOR<LokasiHPPCreateWithoutMasterSheetInput, LokasiHPPUncheckedCreateWithoutMasterSheetInput> | LokasiHPPCreateWithoutMasterSheetInput[] | LokasiHPPUncheckedCreateWithoutMasterSheetInput[]
    connectOrCreate?: LokasiHPPCreateOrConnectWithoutMasterSheetInput | LokasiHPPCreateOrConnectWithoutMasterSheetInput[]
    upsert?: LokasiHPPUpsertWithWhereUniqueWithoutMasterSheetInput | LokasiHPPUpsertWithWhereUniqueWithoutMasterSheetInput[]
    createMany?: LokasiHPPCreateManyMasterSheetInputEnvelope
    set?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    disconnect?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    delete?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    connect?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    update?: LokasiHPPUpdateWithWhereUniqueWithoutMasterSheetInput | LokasiHPPUpdateWithWhereUniqueWithoutMasterSheetInput[]
    updateMany?: LokasiHPPUpdateManyWithWhereWithoutMasterSheetInput | LokasiHPPUpdateManyWithWhereWithoutMasterSheetInput[]
    deleteMany?: LokasiHPPScalarWhereInput | LokasiHPPScalarWhereInput[]
  }

  export type AktivitasHPPUpdateManyWithoutMasterSheetNestedInput = {
    create?: XOR<AktivitasHPPCreateWithoutMasterSheetInput, AktivitasHPPUncheckedCreateWithoutMasterSheetInput> | AktivitasHPPCreateWithoutMasterSheetInput[] | AktivitasHPPUncheckedCreateWithoutMasterSheetInput[]
    connectOrCreate?: AktivitasHPPCreateOrConnectWithoutMasterSheetInput | AktivitasHPPCreateOrConnectWithoutMasterSheetInput[]
    upsert?: AktivitasHPPUpsertWithWhereUniqueWithoutMasterSheetInput | AktivitasHPPUpsertWithWhereUniqueWithoutMasterSheetInput[]
    createMany?: AktivitasHPPCreateManyMasterSheetInputEnvelope
    set?: AktivitasHPPWhereUniqueInput | AktivitasHPPWhereUniqueInput[]
    disconnect?: AktivitasHPPWhereUniqueInput | AktivitasHPPWhereUniqueInput[]
    delete?: AktivitasHPPWhereUniqueInput | AktivitasHPPWhereUniqueInput[]
    connect?: AktivitasHPPWhereUniqueInput | AktivitasHPPWhereUniqueInput[]
    update?: AktivitasHPPUpdateWithWhereUniqueWithoutMasterSheetInput | AktivitasHPPUpdateWithWhereUniqueWithoutMasterSheetInput[]
    updateMany?: AktivitasHPPUpdateManyWithWhereWithoutMasterSheetInput | AktivitasHPPUpdateManyWithWhereWithoutMasterSheetInput[]
    deleteMany?: AktivitasHPPScalarWhereInput | AktivitasHPPScalarWhereInput[]
  }

  export type LokasiHPPUncheckedUpdateManyWithoutMasterSheetNestedInput = {
    create?: XOR<LokasiHPPCreateWithoutMasterSheetInput, LokasiHPPUncheckedCreateWithoutMasterSheetInput> | LokasiHPPCreateWithoutMasterSheetInput[] | LokasiHPPUncheckedCreateWithoutMasterSheetInput[]
    connectOrCreate?: LokasiHPPCreateOrConnectWithoutMasterSheetInput | LokasiHPPCreateOrConnectWithoutMasterSheetInput[]
    upsert?: LokasiHPPUpsertWithWhereUniqueWithoutMasterSheetInput | LokasiHPPUpsertWithWhereUniqueWithoutMasterSheetInput[]
    createMany?: LokasiHPPCreateManyMasterSheetInputEnvelope
    set?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    disconnect?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    delete?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    connect?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    update?: LokasiHPPUpdateWithWhereUniqueWithoutMasterSheetInput | LokasiHPPUpdateWithWhereUniqueWithoutMasterSheetInput[]
    updateMany?: LokasiHPPUpdateManyWithWhereWithoutMasterSheetInput | LokasiHPPUpdateManyWithWhereWithoutMasterSheetInput[]
    deleteMany?: LokasiHPPScalarWhereInput | LokasiHPPScalarWhereInput[]
  }

  export type AktivitasHPPUncheckedUpdateManyWithoutMasterSheetNestedInput = {
    create?: XOR<AktivitasHPPCreateWithoutMasterSheetInput, AktivitasHPPUncheckedCreateWithoutMasterSheetInput> | AktivitasHPPCreateWithoutMasterSheetInput[] | AktivitasHPPUncheckedCreateWithoutMasterSheetInput[]
    connectOrCreate?: AktivitasHPPCreateOrConnectWithoutMasterSheetInput | AktivitasHPPCreateOrConnectWithoutMasterSheetInput[]
    upsert?: AktivitasHPPUpsertWithWhereUniqueWithoutMasterSheetInput | AktivitasHPPUpsertWithWhereUniqueWithoutMasterSheetInput[]
    createMany?: AktivitasHPPCreateManyMasterSheetInputEnvelope
    set?: AktivitasHPPWhereUniqueInput | AktivitasHPPWhereUniqueInput[]
    disconnect?: AktivitasHPPWhereUniqueInput | AktivitasHPPWhereUniqueInput[]
    delete?: AktivitasHPPWhereUniqueInput | AktivitasHPPWhereUniqueInput[]
    connect?: AktivitasHPPWhereUniqueInput | AktivitasHPPWhereUniqueInput[]
    update?: AktivitasHPPUpdateWithWhereUniqueWithoutMasterSheetInput | AktivitasHPPUpdateWithWhereUniqueWithoutMasterSheetInput[]
    updateMany?: AktivitasHPPUpdateManyWithWhereWithoutMasterSheetInput | AktivitasHPPUpdateManyWithWhereWithoutMasterSheetInput[]
    deleteMany?: AktivitasHPPScalarWhereInput | AktivitasHPPScalarWhereInput[]
  }

  export type LokasiHPPCreateNestedManyWithoutBudgetItemInput = {
    create?: XOR<LokasiHPPCreateWithoutBudgetItemInput, LokasiHPPUncheckedCreateWithoutBudgetItemInput> | LokasiHPPCreateWithoutBudgetItemInput[] | LokasiHPPUncheckedCreateWithoutBudgetItemInput[]
    connectOrCreate?: LokasiHPPCreateOrConnectWithoutBudgetItemInput | LokasiHPPCreateOrConnectWithoutBudgetItemInput[]
    createMany?: LokasiHPPCreateManyBudgetItemInputEnvelope
    connect?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
  }

  export type LokasiHPPUncheckedCreateNestedManyWithoutBudgetItemInput = {
    create?: XOR<LokasiHPPCreateWithoutBudgetItemInput, LokasiHPPUncheckedCreateWithoutBudgetItemInput> | LokasiHPPCreateWithoutBudgetItemInput[] | LokasiHPPUncheckedCreateWithoutBudgetItemInput[]
    connectOrCreate?: LokasiHPPCreateOrConnectWithoutBudgetItemInput | LokasiHPPCreateOrConnectWithoutBudgetItemInput[]
    createMany?: LokasiHPPCreateManyBudgetItemInputEnvelope
    connect?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type LokasiHPPUpdateManyWithoutBudgetItemNestedInput = {
    create?: XOR<LokasiHPPCreateWithoutBudgetItemInput, LokasiHPPUncheckedCreateWithoutBudgetItemInput> | LokasiHPPCreateWithoutBudgetItemInput[] | LokasiHPPUncheckedCreateWithoutBudgetItemInput[]
    connectOrCreate?: LokasiHPPCreateOrConnectWithoutBudgetItemInput | LokasiHPPCreateOrConnectWithoutBudgetItemInput[]
    upsert?: LokasiHPPUpsertWithWhereUniqueWithoutBudgetItemInput | LokasiHPPUpsertWithWhereUniqueWithoutBudgetItemInput[]
    createMany?: LokasiHPPCreateManyBudgetItemInputEnvelope
    set?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    disconnect?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    delete?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    connect?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    update?: LokasiHPPUpdateWithWhereUniqueWithoutBudgetItemInput | LokasiHPPUpdateWithWhereUniqueWithoutBudgetItemInput[]
    updateMany?: LokasiHPPUpdateManyWithWhereWithoutBudgetItemInput | LokasiHPPUpdateManyWithWhereWithoutBudgetItemInput[]
    deleteMany?: LokasiHPPScalarWhereInput | LokasiHPPScalarWhereInput[]
  }

  export type LokasiHPPUncheckedUpdateManyWithoutBudgetItemNestedInput = {
    create?: XOR<LokasiHPPCreateWithoutBudgetItemInput, LokasiHPPUncheckedCreateWithoutBudgetItemInput> | LokasiHPPCreateWithoutBudgetItemInput[] | LokasiHPPUncheckedCreateWithoutBudgetItemInput[]
    connectOrCreate?: LokasiHPPCreateOrConnectWithoutBudgetItemInput | LokasiHPPCreateOrConnectWithoutBudgetItemInput[]
    upsert?: LokasiHPPUpsertWithWhereUniqueWithoutBudgetItemInput | LokasiHPPUpsertWithWhereUniqueWithoutBudgetItemInput[]
    createMany?: LokasiHPPCreateManyBudgetItemInputEnvelope
    set?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    disconnect?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    delete?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    connect?: LokasiHPPWhereUniqueInput | LokasiHPPWhereUniqueInput[]
    update?: LokasiHPPUpdateWithWhereUniqueWithoutBudgetItemInput | LokasiHPPUpdateWithWhereUniqueWithoutBudgetItemInput[]
    updateMany?: LokasiHPPUpdateManyWithWhereWithoutBudgetItemInput | LokasiHPPUpdateManyWithWhereWithoutBudgetItemInput[]
    deleteMany?: LokasiHPPScalarWhereInput | LokasiHPPScalarWhereInput[]
  }

  export type MasterSheetCreateNestedOneWithoutLokasiHppListInput = {
    create?: XOR<MasterSheetCreateWithoutLokasiHppListInput, MasterSheetUncheckedCreateWithoutLokasiHppListInput>
    connectOrCreate?: MasterSheetCreateOrConnectWithoutLokasiHppListInput
    connect?: MasterSheetWhereUniqueInput
  }

  export type BudgetCreateNestedOneWithoutLokasiHppListInput = {
    create?: XOR<BudgetCreateWithoutLokasiHppListInput, BudgetUncheckedCreateWithoutLokasiHppListInput>
    connectOrCreate?: BudgetCreateOrConnectWithoutLokasiHppListInput
    connect?: BudgetWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type MasterSheetUpdateOneWithoutLokasiHppListNestedInput = {
    create?: XOR<MasterSheetCreateWithoutLokasiHppListInput, MasterSheetUncheckedCreateWithoutLokasiHppListInput>
    connectOrCreate?: MasterSheetCreateOrConnectWithoutLokasiHppListInput
    upsert?: MasterSheetUpsertWithoutLokasiHppListInput
    disconnect?: MasterSheetWhereInput | boolean
    delete?: MasterSheetWhereInput | boolean
    connect?: MasterSheetWhereUniqueInput
    update?: XOR<XOR<MasterSheetUpdateToOneWithWhereWithoutLokasiHppListInput, MasterSheetUpdateWithoutLokasiHppListInput>, MasterSheetUncheckedUpdateWithoutLokasiHppListInput>
  }

  export type BudgetUpdateOneRequiredWithoutLokasiHppListNestedInput = {
    create?: XOR<BudgetCreateWithoutLokasiHppListInput, BudgetUncheckedCreateWithoutLokasiHppListInput>
    connectOrCreate?: BudgetCreateOrConnectWithoutLokasiHppListInput
    upsert?: BudgetUpsertWithoutLokasiHppListInput
    connect?: BudgetWhereUniqueInput
    update?: XOR<XOR<BudgetUpdateToOneWithWhereWithoutLokasiHppListInput, BudgetUpdateWithoutLokasiHppListInput>, BudgetUncheckedUpdateWithoutLokasiHppListInput>
  }

  export type MasterSheetCreateNestedOneWithoutAktivitasHppListInput = {
    create?: XOR<MasterSheetCreateWithoutAktivitasHppListInput, MasterSheetUncheckedCreateWithoutAktivitasHppListInput>
    connectOrCreate?: MasterSheetCreateOrConnectWithoutAktivitasHppListInput
    connect?: MasterSheetWhereUniqueInput
  }

  export type MasterSheetUpdateOneWithoutAktivitasHppListNestedInput = {
    create?: XOR<MasterSheetCreateWithoutAktivitasHppListInput, MasterSheetUncheckedCreateWithoutAktivitasHppListInput>
    connectOrCreate?: MasterSheetCreateOrConnectWithoutAktivitasHppListInput
    upsert?: MasterSheetUpsertWithoutAktivitasHppListInput
    disconnect?: MasterSheetWhereInput | boolean
    delete?: MasterSheetWhereInput | boolean
    connect?: MasterSheetWhereUniqueInput
    update?: XOR<XOR<MasterSheetUpdateToOneWithWhereWithoutAktivitasHppListInput, MasterSheetUpdateWithoutAktivitasHppListInput>, MasterSheetUncheckedUpdateWithoutAktivitasHppListInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type LokasiHPPCreateWithoutMasterSheetInput = {
    idLokasiHpp: string
    lokasi: string
    periode: number
    tahun?: number | null
    tanggalRawat?: Date | string | null
    status: string
    jenisBibit?: string | null
    kelasBibit?: string | null
    qtyPanen: Decimal | DecimalJsLike | number | string
    luasPanen: Decimal | DecimalJsLike | number | string
    luasAktif: Decimal | DecimalJsLike | number | string
    group: string
    descGroup: string
    jenisBiaya: string
    biaya: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    budgetItem: BudgetCreateNestedOneWithoutLokasiHppListInput
  }

  export type LokasiHPPUncheckedCreateWithoutMasterSheetInput = {
    idLokasiHpp: string
    lokasi: string
    idBudget: string
    periode: number
    tahun?: number | null
    tanggalRawat?: Date | string | null
    status: string
    jenisBibit?: string | null
    kelasBibit?: string | null
    qtyPanen: Decimal | DecimalJsLike | number | string
    luasPanen: Decimal | DecimalJsLike | number | string
    luasAktif: Decimal | DecimalJsLike | number | string
    group: string
    descGroup: string
    jenisBiaya: string
    biaya: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LokasiHPPCreateOrConnectWithoutMasterSheetInput = {
    where: LokasiHPPWhereUniqueInput
    create: XOR<LokasiHPPCreateWithoutMasterSheetInput, LokasiHPPUncheckedCreateWithoutMasterSheetInput>
  }

  export type LokasiHPPCreateManyMasterSheetInputEnvelope = {
    data: LokasiHPPCreateManyMasterSheetInput | LokasiHPPCreateManyMasterSheetInput[]
    skipDuplicates?: boolean
  }

  export type AktivitasHPPCreateWithoutMasterSheetInput = {
    idAktivitas: string
    lokasi: string
    tanggalMulaiRawat?: Date | string | null
    tanggalMulaiTanam?: Date | string | null
    tanggalForcingStandard?: Date | string | null
    rencanaForcing?: Date | string | null
    realForcing?: Date | string | null
    rencanaPanen?: Date | string | null
    aktivitas: string
    biaya: Decimal | DecimalJsLike | number | string
    hasil: Decimal | DecimalJsLike | number | string
    uom: string
    group: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AktivitasHPPUncheckedCreateWithoutMasterSheetInput = {
    idAktivitas: string
    lokasi: string
    tanggalMulaiRawat?: Date | string | null
    tanggalMulaiTanam?: Date | string | null
    tanggalForcingStandard?: Date | string | null
    rencanaForcing?: Date | string | null
    realForcing?: Date | string | null
    rencanaPanen?: Date | string | null
    aktivitas: string
    biaya: Decimal | DecimalJsLike | number | string
    hasil: Decimal | DecimalJsLike | number | string
    uom: string
    group: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AktivitasHPPCreateOrConnectWithoutMasterSheetInput = {
    where: AktivitasHPPWhereUniqueInput
    create: XOR<AktivitasHPPCreateWithoutMasterSheetInput, AktivitasHPPUncheckedCreateWithoutMasterSheetInput>
  }

  export type AktivitasHPPCreateManyMasterSheetInputEnvelope = {
    data: AktivitasHPPCreateManyMasterSheetInput | AktivitasHPPCreateManyMasterSheetInput[]
    skipDuplicates?: boolean
  }

  export type LokasiHPPUpsertWithWhereUniqueWithoutMasterSheetInput = {
    where: LokasiHPPWhereUniqueInput
    update: XOR<LokasiHPPUpdateWithoutMasterSheetInput, LokasiHPPUncheckedUpdateWithoutMasterSheetInput>
    create: XOR<LokasiHPPCreateWithoutMasterSheetInput, LokasiHPPUncheckedCreateWithoutMasterSheetInput>
  }

  export type LokasiHPPUpdateWithWhereUniqueWithoutMasterSheetInput = {
    where: LokasiHPPWhereUniqueInput
    data: XOR<LokasiHPPUpdateWithoutMasterSheetInput, LokasiHPPUncheckedUpdateWithoutMasterSheetInput>
  }

  export type LokasiHPPUpdateManyWithWhereWithoutMasterSheetInput = {
    where: LokasiHPPScalarWhereInput
    data: XOR<LokasiHPPUpdateManyMutationInput, LokasiHPPUncheckedUpdateManyWithoutMasterSheetInput>
  }

  export type LokasiHPPScalarWhereInput = {
    AND?: LokasiHPPScalarWhereInput | LokasiHPPScalarWhereInput[]
    OR?: LokasiHPPScalarWhereInput[]
    NOT?: LokasiHPPScalarWhereInput | LokasiHPPScalarWhereInput[]
    idLokasiHpp?: StringFilter<"LokasiHPP"> | string
    idMaster?: StringNullableFilter<"LokasiHPP"> | string | null
    lokasi?: StringFilter<"LokasiHPP"> | string
    idBudget?: StringFilter<"LokasiHPP"> | string
    periode?: IntFilter<"LokasiHPP"> | number
    tahun?: IntNullableFilter<"LokasiHPP"> | number | null
    tanggalRawat?: DateTimeNullableFilter<"LokasiHPP"> | Date | string | null
    status?: StringFilter<"LokasiHPP"> | string
    jenisBibit?: StringNullableFilter<"LokasiHPP"> | string | null
    kelasBibit?: StringNullableFilter<"LokasiHPP"> | string | null
    qtyPanen?: DecimalFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    group?: StringFilter<"LokasiHPP"> | string
    descGroup?: StringFilter<"LokasiHPP"> | string
    jenisBiaya?: StringFilter<"LokasiHPP"> | string
    biaya?: DecimalFilter<"LokasiHPP"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"LokasiHPP"> | Date | string
    updatedAt?: DateTimeFilter<"LokasiHPP"> | Date | string
  }

  export type AktivitasHPPUpsertWithWhereUniqueWithoutMasterSheetInput = {
    where: AktivitasHPPWhereUniqueInput
    update: XOR<AktivitasHPPUpdateWithoutMasterSheetInput, AktivitasHPPUncheckedUpdateWithoutMasterSheetInput>
    create: XOR<AktivitasHPPCreateWithoutMasterSheetInput, AktivitasHPPUncheckedCreateWithoutMasterSheetInput>
  }

  export type AktivitasHPPUpdateWithWhereUniqueWithoutMasterSheetInput = {
    where: AktivitasHPPWhereUniqueInput
    data: XOR<AktivitasHPPUpdateWithoutMasterSheetInput, AktivitasHPPUncheckedUpdateWithoutMasterSheetInput>
  }

  export type AktivitasHPPUpdateManyWithWhereWithoutMasterSheetInput = {
    where: AktivitasHPPScalarWhereInput
    data: XOR<AktivitasHPPUpdateManyMutationInput, AktivitasHPPUncheckedUpdateManyWithoutMasterSheetInput>
  }

  export type AktivitasHPPScalarWhereInput = {
    AND?: AktivitasHPPScalarWhereInput | AktivitasHPPScalarWhereInput[]
    OR?: AktivitasHPPScalarWhereInput[]
    NOT?: AktivitasHPPScalarWhereInput | AktivitasHPPScalarWhereInput[]
    idAktivitas?: StringFilter<"AktivitasHPP"> | string
    idMaster?: StringNullableFilter<"AktivitasHPP"> | string | null
    lokasi?: StringFilter<"AktivitasHPP"> | string
    tanggalMulaiRawat?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    tanggalMulaiTanam?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    tanggalForcingStandard?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    rencanaForcing?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    realForcing?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    rencanaPanen?: DateTimeNullableFilter<"AktivitasHPP"> | Date | string | null
    aktivitas?: StringFilter<"AktivitasHPP"> | string
    biaya?: DecimalFilter<"AktivitasHPP"> | Decimal | DecimalJsLike | number | string
    hasil?: DecimalFilter<"AktivitasHPP"> | Decimal | DecimalJsLike | number | string
    uom?: StringFilter<"AktivitasHPP"> | string
    group?: StringFilter<"AktivitasHPP"> | string
    createdAt?: DateTimeFilter<"AktivitasHPP"> | Date | string
    updatedAt?: DateTimeFilter<"AktivitasHPP"> | Date | string
  }

  export type LokasiHPPCreateWithoutBudgetItemInput = {
    idLokasiHpp: string
    lokasi: string
    periode: number
    tahun?: number | null
    tanggalRawat?: Date | string | null
    status: string
    jenisBibit?: string | null
    kelasBibit?: string | null
    qtyPanen: Decimal | DecimalJsLike | number | string
    luasPanen: Decimal | DecimalJsLike | number | string
    luasAktif: Decimal | DecimalJsLike | number | string
    group: string
    descGroup: string
    jenisBiaya: string
    biaya: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    masterSheet?: MasterSheetCreateNestedOneWithoutLokasiHppListInput
  }

  export type LokasiHPPUncheckedCreateWithoutBudgetItemInput = {
    idLokasiHpp: string
    idMaster?: string | null
    lokasi: string
    periode: number
    tahun?: number | null
    tanggalRawat?: Date | string | null
    status: string
    jenisBibit?: string | null
    kelasBibit?: string | null
    qtyPanen: Decimal | DecimalJsLike | number | string
    luasPanen: Decimal | DecimalJsLike | number | string
    luasAktif: Decimal | DecimalJsLike | number | string
    group: string
    descGroup: string
    jenisBiaya: string
    biaya: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LokasiHPPCreateOrConnectWithoutBudgetItemInput = {
    where: LokasiHPPWhereUniqueInput
    create: XOR<LokasiHPPCreateWithoutBudgetItemInput, LokasiHPPUncheckedCreateWithoutBudgetItemInput>
  }

  export type LokasiHPPCreateManyBudgetItemInputEnvelope = {
    data: LokasiHPPCreateManyBudgetItemInput | LokasiHPPCreateManyBudgetItemInput[]
    skipDuplicates?: boolean
  }

  export type LokasiHPPUpsertWithWhereUniqueWithoutBudgetItemInput = {
    where: LokasiHPPWhereUniqueInput
    update: XOR<LokasiHPPUpdateWithoutBudgetItemInput, LokasiHPPUncheckedUpdateWithoutBudgetItemInput>
    create: XOR<LokasiHPPCreateWithoutBudgetItemInput, LokasiHPPUncheckedCreateWithoutBudgetItemInput>
  }

  export type LokasiHPPUpdateWithWhereUniqueWithoutBudgetItemInput = {
    where: LokasiHPPWhereUniqueInput
    data: XOR<LokasiHPPUpdateWithoutBudgetItemInput, LokasiHPPUncheckedUpdateWithoutBudgetItemInput>
  }

  export type LokasiHPPUpdateManyWithWhereWithoutBudgetItemInput = {
    where: LokasiHPPScalarWhereInput
    data: XOR<LokasiHPPUpdateManyMutationInput, LokasiHPPUncheckedUpdateManyWithoutBudgetItemInput>
  }

  export type MasterSheetCreateWithoutLokasiHppListInput = {
    idMaster: string
    lokasi: string
    wilayah: string
    jenisBibit: string
    kelasBibit: string
    status?: string
    tanggalRawat: Date | string
    tanggalTanam?: Date | string | null
    tanggalForcingStandard?: Date | string | null
    tanggalRenForcing?: Date | string | null
    tanggalRealForcing?: Date | string | null
    tanggalSelesaiPanen?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    aktivitasHppList?: AktivitasHPPCreateNestedManyWithoutMasterSheetInput
  }

  export type MasterSheetUncheckedCreateWithoutLokasiHppListInput = {
    idMaster: string
    lokasi: string
    wilayah: string
    jenisBibit: string
    kelasBibit: string
    status?: string
    tanggalRawat: Date | string
    tanggalTanam?: Date | string | null
    tanggalForcingStandard?: Date | string | null
    tanggalRenForcing?: Date | string | null
    tanggalRealForcing?: Date | string | null
    tanggalSelesaiPanen?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    aktivitasHppList?: AktivitasHPPUncheckedCreateNestedManyWithoutMasterSheetInput
  }

  export type MasterSheetCreateOrConnectWithoutLokasiHppListInput = {
    where: MasterSheetWhereUniqueInput
    create: XOR<MasterSheetCreateWithoutLokasiHppListInput, MasterSheetUncheckedCreateWithoutLokasiHppListInput>
  }

  export type BudgetCreateWithoutLokasiHppListInput = {
    idBudget: string
    group: string
    status: string
    periode: number
    budget: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BudgetUncheckedCreateWithoutLokasiHppListInput = {
    idBudget: string
    group: string
    status: string
    periode: number
    budget: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BudgetCreateOrConnectWithoutLokasiHppListInput = {
    where: BudgetWhereUniqueInput
    create: XOR<BudgetCreateWithoutLokasiHppListInput, BudgetUncheckedCreateWithoutLokasiHppListInput>
  }

  export type MasterSheetUpsertWithoutLokasiHppListInput = {
    update: XOR<MasterSheetUpdateWithoutLokasiHppListInput, MasterSheetUncheckedUpdateWithoutLokasiHppListInput>
    create: XOR<MasterSheetCreateWithoutLokasiHppListInput, MasterSheetUncheckedCreateWithoutLokasiHppListInput>
    where?: MasterSheetWhereInput
  }

  export type MasterSheetUpdateToOneWithWhereWithoutLokasiHppListInput = {
    where?: MasterSheetWhereInput
    data: XOR<MasterSheetUpdateWithoutLokasiHppListInput, MasterSheetUncheckedUpdateWithoutLokasiHppListInput>
  }

  export type MasterSheetUpdateWithoutLokasiHppListInput = {
    idMaster?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    wilayah?: StringFieldUpdateOperationsInput | string
    jenisBibit?: StringFieldUpdateOperationsInput | string
    kelasBibit?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    tanggalRawat?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggalTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRenForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRealForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalSelesaiPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aktivitasHppList?: AktivitasHPPUpdateManyWithoutMasterSheetNestedInput
  }

  export type MasterSheetUncheckedUpdateWithoutLokasiHppListInput = {
    idMaster?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    wilayah?: StringFieldUpdateOperationsInput | string
    jenisBibit?: StringFieldUpdateOperationsInput | string
    kelasBibit?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    tanggalRawat?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggalTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRenForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRealForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalSelesaiPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aktivitasHppList?: AktivitasHPPUncheckedUpdateManyWithoutMasterSheetNestedInput
  }

  export type BudgetUpsertWithoutLokasiHppListInput = {
    update: XOR<BudgetUpdateWithoutLokasiHppListInput, BudgetUncheckedUpdateWithoutLokasiHppListInput>
    create: XOR<BudgetCreateWithoutLokasiHppListInput, BudgetUncheckedCreateWithoutLokasiHppListInput>
    where?: BudgetWhereInput
  }

  export type BudgetUpdateToOneWithWhereWithoutLokasiHppListInput = {
    where?: BudgetWhereInput
    data: XOR<BudgetUpdateWithoutLokasiHppListInput, BudgetUncheckedUpdateWithoutLokasiHppListInput>
  }

  export type BudgetUpdateWithoutLokasiHppListInput = {
    idBudget?: StringFieldUpdateOperationsInput | string
    group?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    budget?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BudgetUncheckedUpdateWithoutLokasiHppListInput = {
    idBudget?: StringFieldUpdateOperationsInput | string
    group?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    budget?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MasterSheetCreateWithoutAktivitasHppListInput = {
    idMaster: string
    lokasi: string
    wilayah: string
    jenisBibit: string
    kelasBibit: string
    status?: string
    tanggalRawat: Date | string
    tanggalTanam?: Date | string | null
    tanggalForcingStandard?: Date | string | null
    tanggalRenForcing?: Date | string | null
    tanggalRealForcing?: Date | string | null
    tanggalSelesaiPanen?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lokasiHppList?: LokasiHPPCreateNestedManyWithoutMasterSheetInput
  }

  export type MasterSheetUncheckedCreateWithoutAktivitasHppListInput = {
    idMaster: string
    lokasi: string
    wilayah: string
    jenisBibit: string
    kelasBibit: string
    status?: string
    tanggalRawat: Date | string
    tanggalTanam?: Date | string | null
    tanggalForcingStandard?: Date | string | null
    tanggalRenForcing?: Date | string | null
    tanggalRealForcing?: Date | string | null
    tanggalSelesaiPanen?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lokasiHppList?: LokasiHPPUncheckedCreateNestedManyWithoutMasterSheetInput
  }

  export type MasterSheetCreateOrConnectWithoutAktivitasHppListInput = {
    where: MasterSheetWhereUniqueInput
    create: XOR<MasterSheetCreateWithoutAktivitasHppListInput, MasterSheetUncheckedCreateWithoutAktivitasHppListInput>
  }

  export type MasterSheetUpsertWithoutAktivitasHppListInput = {
    update: XOR<MasterSheetUpdateWithoutAktivitasHppListInput, MasterSheetUncheckedUpdateWithoutAktivitasHppListInput>
    create: XOR<MasterSheetCreateWithoutAktivitasHppListInput, MasterSheetUncheckedCreateWithoutAktivitasHppListInput>
    where?: MasterSheetWhereInput
  }

  export type MasterSheetUpdateToOneWithWhereWithoutAktivitasHppListInput = {
    where?: MasterSheetWhereInput
    data: XOR<MasterSheetUpdateWithoutAktivitasHppListInput, MasterSheetUncheckedUpdateWithoutAktivitasHppListInput>
  }

  export type MasterSheetUpdateWithoutAktivitasHppListInput = {
    idMaster?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    wilayah?: StringFieldUpdateOperationsInput | string
    jenisBibit?: StringFieldUpdateOperationsInput | string
    kelasBibit?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    tanggalRawat?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggalTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRenForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRealForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalSelesaiPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lokasiHppList?: LokasiHPPUpdateManyWithoutMasterSheetNestedInput
  }

  export type MasterSheetUncheckedUpdateWithoutAktivitasHppListInput = {
    idMaster?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    wilayah?: StringFieldUpdateOperationsInput | string
    jenisBibit?: StringFieldUpdateOperationsInput | string
    kelasBibit?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    tanggalRawat?: DateTimeFieldUpdateOperationsInput | Date | string
    tanggalTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRenForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalRealForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalSelesaiPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lokasiHppList?: LokasiHPPUncheckedUpdateManyWithoutMasterSheetNestedInput
  }

  export type LokasiHPPCreateManyMasterSheetInput = {
    idLokasiHpp: string
    lokasi: string
    idBudget: string
    periode: number
    tahun?: number | null
    tanggalRawat?: Date | string | null
    status: string
    jenisBibit?: string | null
    kelasBibit?: string | null
    qtyPanen: Decimal | DecimalJsLike | number | string
    luasPanen: Decimal | DecimalJsLike | number | string
    luasAktif: Decimal | DecimalJsLike | number | string
    group: string
    descGroup: string
    jenisBiaya: string
    biaya: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AktivitasHPPCreateManyMasterSheetInput = {
    idAktivitas: string
    lokasi: string
    tanggalMulaiRawat?: Date | string | null
    tanggalMulaiTanam?: Date | string | null
    tanggalForcingStandard?: Date | string | null
    rencanaForcing?: Date | string | null
    realForcing?: Date | string | null
    rencanaPanen?: Date | string | null
    aktivitas: string
    biaya: Decimal | DecimalJsLike | number | string
    hasil: Decimal | DecimalJsLike | number | string
    uom: string
    group: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LokasiHPPUpdateWithoutMasterSheetInput = {
    idLokasiHpp?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    tahun?: NullableIntFieldUpdateOperationsInput | number | null
    tanggalRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: StringFieldUpdateOperationsInput | string
    jenisBibit?: NullableStringFieldUpdateOperationsInput | string | null
    kelasBibit?: NullableStringFieldUpdateOperationsInput | string | null
    qtyPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    group?: StringFieldUpdateOperationsInput | string
    descGroup?: StringFieldUpdateOperationsInput | string
    jenisBiaya?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    budgetItem?: BudgetUpdateOneRequiredWithoutLokasiHppListNestedInput
  }

  export type LokasiHPPUncheckedUpdateWithoutMasterSheetInput = {
    idLokasiHpp?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    idBudget?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    tahun?: NullableIntFieldUpdateOperationsInput | number | null
    tanggalRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: StringFieldUpdateOperationsInput | string
    jenisBibit?: NullableStringFieldUpdateOperationsInput | string | null
    kelasBibit?: NullableStringFieldUpdateOperationsInput | string | null
    qtyPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    group?: StringFieldUpdateOperationsInput | string
    descGroup?: StringFieldUpdateOperationsInput | string
    jenisBiaya?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LokasiHPPUncheckedUpdateManyWithoutMasterSheetInput = {
    idLokasiHpp?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    idBudget?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    tahun?: NullableIntFieldUpdateOperationsInput | number | null
    tanggalRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: StringFieldUpdateOperationsInput | string
    jenisBibit?: NullableStringFieldUpdateOperationsInput | string | null
    kelasBibit?: NullableStringFieldUpdateOperationsInput | string | null
    qtyPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    group?: StringFieldUpdateOperationsInput | string
    descGroup?: StringFieldUpdateOperationsInput | string
    jenisBiaya?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AktivitasHPPUpdateWithoutMasterSheetInput = {
    idAktivitas?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    tanggalMulaiRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalMulaiTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    realForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    aktivitas?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    hasil?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    uom?: StringFieldUpdateOperationsInput | string
    group?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AktivitasHPPUncheckedUpdateWithoutMasterSheetInput = {
    idAktivitas?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    tanggalMulaiRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalMulaiTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    realForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    aktivitas?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    hasil?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    uom?: StringFieldUpdateOperationsInput | string
    group?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AktivitasHPPUncheckedUpdateManyWithoutMasterSheetInput = {
    idAktivitas?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    tanggalMulaiRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalMulaiTanam?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tanggalForcingStandard?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    realForcing?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rencanaPanen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    aktivitas?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    hasil?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    uom?: StringFieldUpdateOperationsInput | string
    group?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LokasiHPPCreateManyBudgetItemInput = {
    idLokasiHpp: string
    idMaster?: string | null
    lokasi: string
    periode: number
    tahun?: number | null
    tanggalRawat?: Date | string | null
    status: string
    jenisBibit?: string | null
    kelasBibit?: string | null
    qtyPanen: Decimal | DecimalJsLike | number | string
    luasPanen: Decimal | DecimalJsLike | number | string
    luasAktif: Decimal | DecimalJsLike | number | string
    group: string
    descGroup: string
    jenisBiaya: string
    biaya: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LokasiHPPUpdateWithoutBudgetItemInput = {
    idLokasiHpp?: StringFieldUpdateOperationsInput | string
    lokasi?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    tahun?: NullableIntFieldUpdateOperationsInput | number | null
    tanggalRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: StringFieldUpdateOperationsInput | string
    jenisBibit?: NullableStringFieldUpdateOperationsInput | string | null
    kelasBibit?: NullableStringFieldUpdateOperationsInput | string | null
    qtyPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    group?: StringFieldUpdateOperationsInput | string
    descGroup?: StringFieldUpdateOperationsInput | string
    jenisBiaya?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    masterSheet?: MasterSheetUpdateOneWithoutLokasiHppListNestedInput
  }

  export type LokasiHPPUncheckedUpdateWithoutBudgetItemInput = {
    idLokasiHpp?: StringFieldUpdateOperationsInput | string
    idMaster?: NullableStringFieldUpdateOperationsInput | string | null
    lokasi?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    tahun?: NullableIntFieldUpdateOperationsInput | number | null
    tanggalRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: StringFieldUpdateOperationsInput | string
    jenisBibit?: NullableStringFieldUpdateOperationsInput | string | null
    kelasBibit?: NullableStringFieldUpdateOperationsInput | string | null
    qtyPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    group?: StringFieldUpdateOperationsInput | string
    descGroup?: StringFieldUpdateOperationsInput | string
    jenisBiaya?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LokasiHPPUncheckedUpdateManyWithoutBudgetItemInput = {
    idLokasiHpp?: StringFieldUpdateOperationsInput | string
    idMaster?: NullableStringFieldUpdateOperationsInput | string | null
    lokasi?: StringFieldUpdateOperationsInput | string
    periode?: IntFieldUpdateOperationsInput | number
    tahun?: NullableIntFieldUpdateOperationsInput | number | null
    tanggalRawat?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: StringFieldUpdateOperationsInput | string
    jenisBibit?: NullableStringFieldUpdateOperationsInput | string | null
    kelasBibit?: NullableStringFieldUpdateOperationsInput | string | null
    qtyPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasPanen?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    luasAktif?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    group?: StringFieldUpdateOperationsInput | string
    descGroup?: StringFieldUpdateOperationsInput | string
    jenisBiaya?: StringFieldUpdateOperationsInput | string
    biaya?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}