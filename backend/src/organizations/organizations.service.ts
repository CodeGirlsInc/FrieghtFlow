// #996 – Organization/company accounts: multi-user shipper teams
import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

export interface OrgMember {
  userId: string;
  role: string;
}
export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  members: OrgMember[];
}

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);
  private readonly orgs = new Map<string, Organization>();

  create(ownerId: string, name: string): Promise<Organization> {
    const org: Organization = {
      id: `org_${Date.now()}`,
      name,
      ownerId,
      members: [{ userId: ownerId, role: 'owner' }],
    };
    this.orgs.set(org.id, org);
    this.logger.log(`Org created: ${org.id}`);
    return Promise.resolve(org);
  }

  inviteMember(
    orgId: string,
    requesterId: string,
    inviteeId: string,
    role: string,
  ): Promise<Organization> {
    const org = this.orgs.get(orgId);
    if (!org) throw new NotFoundException('Organization not found');
    if (org.ownerId !== requesterId)
      throw new BadRequestException('Only owner can invite members');
    org.members.push({ userId: inviteeId, role });
    return Promise.resolve(org);
  }

  removeMember(
    orgId: string,
    requesterId: string,
    memberId: string,
  ): Promise<Organization> {
    const org = this.orgs.get(orgId);
    if (!org) throw new NotFoundException('Organization not found');
    if (org.ownerId !== requesterId)
      throw new BadRequestException('Only owner can remove members');
    org.members = org.members.filter((m) => m.userId !== memberId);
    return Promise.resolve(org);
  }

  findByOwner(ownerId: string): Promise<Organization[]> {
    return Promise.resolve(
      [...this.orgs.values()].filter((o) => o.ownerId === ownerId),
    );
  }
}
