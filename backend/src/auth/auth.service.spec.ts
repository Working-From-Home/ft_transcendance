import { BadRequestException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import { User } from '../users/entities/user.entity'
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants'

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        const users: User[] = [];
        fakeUsersService = {
            create: (email: string, username: string, password: string) => {
                const user = { id: Math.floor(Math.random() * 99999), email, username, password } as User; 
                users.push(user);
                return Promise.resolve(user);
            },
            update: (id: number, attrs: Partial<User>) => {
                const filteredUsers = users.filter(user => user.id === id);
                if (filteredUsers.length === 0) {
                    return null;
                }
                if (attrs.email) {
                    filteredUsers[0].email = attrs.email;
                }
                if (attrs.username) {
                    filteredUsers[0].username = attrs.username;
                }
                if (attrs.password) {
                    filteredUsers[0].password = attrs.password;
                }
                return Promise.resolve(filteredUsers[0]);
            },
            findById: (id: number) => {
                const filteredUsers = users.filter(user => user.id === id);
                return Promise.resolve(filteredUsers[0]);
            },
            findByName: (username: string) => {
                const filteredUsers = users.filter(user => user.username === username);
                return Promise.resolve(filteredUsers[0]);
            },
            findByEmail: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers[0]);
            }
        };
        const module = await Test.createTestingModule({
            imports: [
                JwtModule.register({
                    secret: jwtConstants.secret,
                    signOptions: { expiresIn: '60s' }
                })
            ],
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService
                }
            ]
        }).compile();
        service = module.get(AuthService);
    });

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('returns an access_token if a user signs up with valid credentials', async () => {
        const obj = await service.signup('email',  'unusedUsername', 'password');
        expect(obj).toBeDefined();
        expect(obj.access_token).toBeDefined();
        expect(obj.access_token.length).toBeGreaterThan(0);
    });

    it('throws an error if a user signs up with an already used email', async () => {
        await service.signup('email',  'unusedUsername', 'password');
        try {
            await service.signup('email',  'name', 'password');
        } catch (err) {
            expect(err).toEqual(new BadRequestException('email in use'));
        }
    });

    it('throws an error if a user signs up with an already used username', async () => {
        await service.signup('email',  'username', 'password');
        try {
            await service.signup('mail',  'username', 'password');
        } catch (err) {
            expect(err).toEqual(new BadRequestException('username in use'));
        }
    });

    it('returns an access_token if a user signs in with valid credentials', async () => {
        await service.signup('email',  'username', 'password');
        const obj = await service.signin('username', 'password');
        expect(obj).toBeDefined();
        expect(obj.access_token).toBeDefined();
        expect(obj.access_token.length).toBeGreaterThan(0);
    });

    it('throws an error if a user signs in with an unknown username', async () => {
        try {
            await service.signin('name', 'password');
        } catch (err) {
            expect(err).toEqual(new BadRequestException('user not found'));
        }
    });

    it('throws an error if a user signs in with an invalid password', async () => {
        await service.signup('email',  'username', 'password');
        try {
            await service.signin('username', 'badPassword');
        } catch (err) {
            expect(err).toEqual(new BadRequestException('bad password'));
        }
    });

    it('updates the email of an existing user', async () => {
        await service.signup('email', 'username', 'password');
        let user = await fakeUsersService.findByName("username");
        const obj = await service.update(user.id, { username: "newName" });
        user = await fakeUsersService.findByName("newName");
        expect(user.email).toEqual('email');
        expect(obj).toBeDefined();
        expect(obj.access_token).toBeDefined();
        expect(obj.access_token.length).toBeGreaterThan(0);
    });

    it('throws an error if a user updates his credentials with already used email', async () => {
        await service.signup('1', '1', '1');
        await service.signup('2', '2', '2');
        let user = await fakeUsersService.findByName('1');
        try {
            await service.update(user.id, { email: '2' });
        } catch(err) {
            expect(err).toEqual(new BadRequestException('email in use'));
        }
    });

    it('throws an error if a user updates his credentials with already used username', async () => {
        await service.signup('1', '1', '1');
        await service.signup('2', '2', '2');
        let user = await fakeUsersService.findByName('1');
        try {
            await service.update(user.id, { username: '2' });
        } catch(err) {
            expect(err).toEqual(new BadRequestException('username in use'));
        }
    });
});