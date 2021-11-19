import { BadRequestException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AuthService } from '../services/auth.service'
import { UsersService } from '../services/users.service'
import { User } from '../entities/user.entity'
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../constants'

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
            findById: (id: number) => {
                const filteredUsers = users.filter(user => user.id === id);
                return Promise.resolve(filteredUsers[0]);
            },
            findByName: (username: string) => {
                const filteredUsers = users.filter(user => user.username === username);
                return Promise.resolve(filteredUsers);
            },
            findByEmail: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers);
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
            expect(err).toEqual(new BadRequestException('Email in use'));
        }
    });

    it('throws an error if a user signs up with an already used username', async () => {
        await service.signup('email',  'username', 'password');
        try {
            await service.signup('mail',  'username', 'password');
        } catch (err) {
            expect(err).toEqual(new BadRequestException('Username in use'));
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
            expect(err).toEqual(new BadRequestException('User not found'));
        }
    });

    it('throws an error if a user signs in with an invalid password', async () => {
        await service.signup('email',  'username', 'password');
        try {
            await service.signin('username', 'badPassword');
        } catch (err) {
            expect(err).toEqual(new BadRequestException('Bad password'));
        }
    });
});
