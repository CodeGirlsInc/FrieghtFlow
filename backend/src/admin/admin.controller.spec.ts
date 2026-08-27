import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CarrierCertificationsService } from '../carriers/carrier-certifications.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/role.enum';

describe('AdminController', () => {
  let app: INestApplication;
  let adminService: { getStats: jest.Mock; changeUserRole: jest.Mock; listUsers: jest.Mock; findUser: jest.Mock; deactivateUser: jest.Mock; activateUser: jest.Mock; listShipments: jest.Mock };
  let certificationsService: { updateVerification: jest.Mock };

  beforeEach(async () => {
    adminService = {
      getStats: jest.fn().mockResolvedValue({ ok: true }),
      changeUserRole: jest.fn().mockResolvedValue({ id: 'user-1' }),
      listUsers: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      findUser: jest.fn().mockResolvedValue({ id: 'user-1' }),
      deactivateUser: jest.fn().mockResolvedValue({ id: 'user-1', isActive: false }),
      activateUser: jest.fn().mockResolvedValue({ id: 'user-1', isActive: true }),
      listShipments: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    };
    certificationsService = {
      updateVerification: jest.fn().mockResolvedValue({ id: 'cert-1' }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: adminService },
        { provide: CarrierCertificationsService, useValue: certificationsService },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          if (!req.user) {
            throw new UnauthorizedException();
          }
          return req.user.role === UserRole.ADMIN;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      const role = req.header('x-user-role') as UserRole | undefined;
      if (role) {
        req.user = { role } as never;
      }
      next();
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 401 without an authenticated user', async () => {
    await request(app.getHttpServer()).get('/admin/stats').expect(401);
  });

  it('returns 403 for non-admin users', async () => {
    await request(app.getHttpServer())
      .get('/admin/stats')
      .set('x-user-role', UserRole.SHIPPER)
      .expect(403);
  });

  it('returns 200 for admins and validates role updates', async () => {
    await request(app.getHttpServer())
      .get('/admin/stats')
      .set('x-user-role', UserRole.ADMIN)
      .expect(200);

    await request(app.getHttpServer())
      .patch('/admin/users/user-1/role')
      .set('x-user-role', UserRole.ADMIN)
      .send({ role: 'invalid' })
      .expect(400);
  });
});
