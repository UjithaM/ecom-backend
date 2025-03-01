import { Role } from '../entities/role.entity';
import { DataSource } from 'typeorm';

export class RoleSeeder {
  public async run(dataSource: DataSource): Promise<void> {
    console.log('Seeding roles...');
    const roleRepository = dataSource.getRepository(Role);

    const roles = [{ name: 'ADMIN' }, { name: 'USER' }];

    for (const role of roles) {
      const roleExists = await roleRepository.findOneBy({ name: role.name });
      if (!roleExists) {
        await roleRepository.save(role);
        console.log(`Role ${role.name} has been created`);
      }
    }
  }
}
