const firstNames = ['Ava', 'Milo', 'Leo', 'Nia', 'Rory', 'Sage', 'Theo', 'Uma', 'Vera', 'Zane'];
const lastNames = ['Rivera', 'Chen', 'Holt', 'Iqbal', 'Jansen', 'Kim', 'Lopez', 'Nguyen', 'Patel', 'Singh'];
const titles = ['CEO', 'Head of Product', 'Engineering Lead', 'Design Lead', 'Operations Lead', 'Product Manager', 'Software Engineer', 'UX Designer', 'Customer Success'];
const departments = ['Executive', 'Product', 'Engineering', 'Design', 'Operations', 'Success'];
const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
const randomAvatar = () => `https://i.pravatar.cc/96?img=${Math.floor(Math.random() * 70) + 1}`;
const buildEmail = (first, last) => `${first}.${last}`.toLowerCase() + '@example.com';
export const createSampleDirectory = () => {
    const people = [];
    const rootFirst = randomItem(firstNames);
    const rootLast = randomItem(lastNames);
    const rootEmail = buildEmail(rootFirst, rootLast);
    const root = {
        id: 'root',
        primaryEmail: rootEmail,
        displayName: `${rootFirst} ${rootLast}`,
        jobTitle: 'CEO',
        department: 'Executive',
        photoUrl: randomAvatar()
    };
    people.push(root);
    const teamCount = 3;
    for (let i = 0; i < teamCount; i += 1) {
        const leadFirst = randomItem(firstNames);
        const leadLast = randomItem(lastNames);
        const leadEmail = buildEmail(leadFirst, leadLast);
        const department = departments[(i + 1) % departments.length];
        const lead = {
            id: `lead-${i}`,
            primaryEmail: leadEmail,
            displayName: `${leadFirst} ${leadLast}`,
            jobTitle: randomItem(titles.slice(1, 5)),
            department,
            managerEmail: rootEmail,
            photoUrl: randomAvatar()
        };
        people.push(lead);
        for (let j = 0; j < 3; j += 1) {
            const memberFirst = randomItem(firstNames);
            const memberLast = randomItem(lastNames);
            const member = {
                id: `member-${i}-${j}`,
                primaryEmail: buildEmail(memberFirst, memberLast),
                displayName: `${memberFirst} ${memberLast}`,
                jobTitle: randomItem(titles.slice(5)),
                department,
                managerEmail: leadEmail,
                photoUrl: randomAvatar()
            };
            people.push(member);
        }
    }
    return people;
};
