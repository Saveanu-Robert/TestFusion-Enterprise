/**
 * Domain Models for TestFusion-Enterprise
 *
 * Implements Domain-Driven Design (DDD) principles with:
 * - Value Objects for type safety and validation
 * - Entity base classes with identity management
 * - Domain events for loose coupling
 * - Rich domain models with business logic
 * - Immutable data structures
 *
 * @file models/domain-models.ts
 * @author TestFusion-Enterprise Team
 * @version 2.0.0
 */

/**
 * Base Value Object implementation
 * Provides equality comparison and immutability
 */
export abstract class ValueObject<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this._value = Object.freeze(value);
  }

  public get value(): T {
    return this._value;
  }

  public equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this._value) === JSON.stringify(other._value);
  }

  public toString(): string {
    return JSON.stringify(this._value);
  }
}

/**
 * Entity base class with identity management
 */
export abstract class Entity<TId> {
  protected constructor(protected readonly _id: TId) {}

  public get id(): TId {
    return this._id;
  }

  public equals(other: Entity<TId>): boolean {
    return this._id === other._id;
  }
}

/**
 * Strong-typed ID value objects
 */
export class UserId extends ValueObject<number> {
  constructor(value: number) {
    if (value <= 0) {
      throw new Error('User ID must be a positive number');
    }
    super(value);
  }

  public static create(value: number): UserId {
    return new UserId(value);
  }
}

export class PostId extends ValueObject<number> {
  constructor(value: number) {
    if (value <= 0) {
      throw new Error('Post ID must be a positive number');
    }
    super(value);
  }

  public static create(value: number): PostId {
    return new PostId(value);
  }
}

export class CommentId extends ValueObject<number> {
  constructor(value: number) {
    if (value <= 0) {
      throw new Error('Comment ID must be a positive number');
    }
    super(value);
  }

  public static create(value: number): CommentId {
    return new CommentId(value);
  }
}

/**
 * Email value object with validation
 */
export class EmailAddress extends ValueObject<string> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Email address cannot be empty');
    }

    const normalizedValue = value.trim().toLowerCase();
    if (!EmailAddress.EMAIL_REGEX.test(normalizedValue)) {
      throw new Error(`Invalid email address format: ${value}`);
    }

    super(normalizedValue);
  }

  public static create(value: string): EmailAddress {
    return new EmailAddress(value);
  }
  public getDomain(): string {
    const parts = this._value.split('@');
    return parts[1] || '';
  }

  public getLocalPart(): string {
    const parts = this._value.split('@');
    return parts[0] || '';
  }
}

/**
 * Website URL value object with validation
 */
export class WebsiteUrl extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Website URL cannot be empty');
    }

    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Website URL must use http or https protocol');
      }
      super(url.toString());
    } catch (error) {
      throw new Error(`Invalid website URL format: ${value}`);
    }
  }

  public static create(value: string): WebsiteUrl {
    return new WebsiteUrl(value);
  }

  public getDomain(): string {
    return new URL(this._value).hostname;
  }

  public getProtocol(): string {
    return new URL(this._value).protocol;
  }
}

/**
 * Post title value object with validation
 */
export class PostTitle extends ValueObject<string> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 200;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Post title cannot be empty');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length < PostTitle.MIN_LENGTH) {
      throw new Error(`Post title must be at least ${PostTitle.MIN_LENGTH} characters long`);
    }

    if (trimmedValue.length > PostTitle.MAX_LENGTH) {
      throw new Error(`Post title must not exceed ${PostTitle.MAX_LENGTH} characters`);
    }

    super(trimmedValue);
  }

  public static create(value: string): PostTitle {
    return new PostTitle(value);
  }

  public getWordCount(): number {
    return this._value.split(/\s+/).filter(word => word.length > 0).length;
  }
}

/**
 * Post body value object with validation
 */
export class PostBody extends ValueObject<string> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 10000;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Post body cannot be empty');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length < PostBody.MIN_LENGTH) {
      throw new Error(`Post body must be at least ${PostBody.MIN_LENGTH} characters long`);
    }

    if (trimmedValue.length > PostBody.MAX_LENGTH) {
      throw new Error(`Post body must not exceed ${PostBody.MAX_LENGTH} characters`);
    }

    super(trimmedValue);
  }

  public static create(value: string): PostBody {
    return new PostBody(value);
  }

  public getWordCount(): number {
    return this._value.split(/\s+/).filter(word => word.length > 0).length;
  }

  public getCharacterCount(): number {
    return this._value.length;
  }
}

/**
 * Geographic coordinates value object
 */
export class GeoCoordinates extends ValueObject<{ lat: number; lng: number }> {
  constructor(lat: number, lng: number) {
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees');
    }
    if (lng < -180 || lng > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees');
    }
    super({ lat, lng });
  }

  public static create(lat: number, lng: number): GeoCoordinates {
    return new GeoCoordinates(lat, lng);
  }

  public getLatitude(): number {
    return this._value.lat;
  }

  public getLongitude(): number {
    return this._value.lng;
  }

  public distanceTo(other: GeoCoordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(other.getLatitude() - this.getLatitude());
    const dLng = this.toRadians(other.getLongitude() - this.getLongitude());

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this.getLatitude())) *
        Math.cos(this.toRadians(other.getLatitude())) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

/**
 * Address value object with structured components
 */
export class Address extends ValueObject<{
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: GeoCoordinates;
}> {
  constructor(street: string, suite: string, city: string, zipcode: string, geo: GeoCoordinates) {
    if (!street || street.trim().length === 0) {
      throw new Error('Street address cannot be empty');
    }
    if (!city || city.trim().length === 0) {
      throw new Error('City cannot be empty');
    }
    if (!zipcode || zipcode.trim().length === 0) {
      throw new Error('Zipcode cannot be empty');
    }

    super({
      street: street.trim(),
      suite: suite.trim(),
      city: city.trim(),
      zipcode: zipcode.trim(),
      geo,
    });
  }

  public static create(street: string, suite: string, city: string, zipcode: string, geo: GeoCoordinates): Address {
    return new Address(street, suite, city, zipcode, geo);
  }

  public getFullAddress(): string {
    const suite = this._value.suite ? `, ${this._value.suite}` : '';
    return `${this._value.street}${suite}, ${this._value.city} ${this._value.zipcode}`;
  }

  public getCoordinates(): GeoCoordinates {
    return this._value.geo;
  }
}

/**
 * Company value object with business information
 */
export class Company extends ValueObject<{
  name: string;
  catchPhrase: string;
  bs: string;
}> {
  constructor(name: string, catchPhrase: string, bs: string) {
    if (!name || name.trim().length === 0) {
      throw new Error('Company name cannot be empty');
    }

    super({
      name: name.trim(),
      catchPhrase: catchPhrase.trim(),
      bs: bs.trim(),
    });
  }

  public static create(name: string, catchPhrase: string, bs: string): Company {
    return new Company(name, catchPhrase, bs);
  }

  public getName(): string {
    return this._value.name;
  }

  public getCatchPhrase(): string {
    return this._value.catchPhrase;
  }

  public getBusinessStrategy(): string {
    return this._value.bs;
  }
}

/**
 * User entity with rich domain behavior
 */
export class User extends Entity<UserId> {
  constructor(
    id: UserId,
    private readonly _name: string,
    private readonly _username: string,
    private readonly _email: EmailAddress,
    private readonly _address: Address,
    private readonly _phone: string,
    private readonly _website: WebsiteUrl,
    private readonly _company: Company
  ) {
    super(id);

    if (!_name || _name.trim().length === 0) {
      throw new Error('User name cannot be empty');
    }
    if (!_username || _username.trim().length === 0) {
      throw new Error('Username cannot be empty');
    }
    if (!_phone || _phone.trim().length === 0) {
      throw new Error('Phone number cannot be empty');
    }
  }

  public static create(
    id: number,
    name: string,
    username: string,
    email: string,
    address: {
      street: string;
      suite: string;
      city: string;
      zipcode: string;
      geo: { lat: number; lng: number };
    },
    phone: string,
    website: string,
    company: {
      name: string;
      catchPhrase: string;
      bs: string;
    }
  ): User {
    return new User(
      UserId.create(id),
      name,
      username,
      EmailAddress.create(email),
      Address.create(
        address.street,
        address.suite,
        address.city,
        address.zipcode,
        GeoCoordinates.create(address.geo.lat, address.geo.lng)
      ),
      phone,
      WebsiteUrl.create(website),
      Company.create(company.name, company.catchPhrase, company.bs)
    );
  }

  public getName(): string {
    return this._name;
  }

  public getUsername(): string {
    return this._username;
  }

  public getEmail(): EmailAddress {
    return this._email;
  }

  public getAddress(): Address {
    return this._address;
  }

  public getPhone(): string {
    return this._phone;
  }

  public getWebsite(): WebsiteUrl {
    return this._website;
  }

  public getCompany(): Company {
    return this._company;
  }

  public isInSameCity(other: User): boolean {
    return this._address.value.city === other._address.value.city;
  }

  public getDistanceFrom(other: User): number {
    return this._address.getCoordinates().distanceTo(other._address.getCoordinates());
  }
}

/**
 * Post entity with rich domain behavior
 */
export class Post extends Entity<PostId> {
  constructor(
    id: PostId,
    private readonly _userId: UserId,
    private readonly _title: PostTitle,
    private readonly _body: PostBody
  ) {
    super(id);
  }

  public static create(id: number, userId: number, title: string, body: string): Post {
    return new Post(PostId.create(id), UserId.create(userId), PostTitle.create(title), PostBody.create(body));
  }

  public getUserId(): UserId {
    return this._userId;
  }

  public getTitle(): PostTitle {
    return this._title;
  }

  public getBody(): PostBody {
    return this._body;
  }

  public belongsToUser(userId: UserId): boolean {
    return this._userId.equals(userId);
  }

  public getContentSummary(): string {
    const maxLength = 100;
    const content = `${this._title.value}: ${this._body.value}`;
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }

  public getTotalWordCount(): number {
    return this._title.getWordCount() + this._body.getWordCount();
  }
}

/**
 * Comment entity with rich domain behavior
 */
export class Comment extends Entity<CommentId> {
  constructor(
    id: CommentId,
    private readonly _postId: PostId,
    private readonly _name: string,
    private readonly _email: EmailAddress,
    private readonly _body: string
  ) {
    super(id);

    if (!_name || _name.trim().length === 0) {
      throw new Error('Comment name cannot be empty');
    }
    if (!_body || _body.trim().length === 0) {
      throw new Error('Comment body cannot be empty');
    }
  }

  public static create(id: number, postId: number, name: string, email: string, body: string): Comment {
    return new Comment(CommentId.create(id), PostId.create(postId), name, EmailAddress.create(email), body);
  }

  public getPostId(): PostId {
    return this._postId;
  }

  public getName(): string {
    return this._name;
  }

  public getEmail(): EmailAddress {
    return this._email;
  }

  public getBody(): string {
    return this._body;
  }

  public belongsToPost(postId: PostId): boolean {
    return this._postId.equals(postId);
  }

  public getWordCount(): number {
    return this._body.split(/\s+/).filter(word => word.length > 0).length;
  }

  public isFromVerifiedDomain(): boolean {
    const verifiedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    return verifiedDomains.includes(this._email.getDomain());
  }
}
