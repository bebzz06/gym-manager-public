export async function up(db) {
  await db.collection('users').updateMany(
    { 'activeMembershipPlan.isActive': { $exists: true } },
    {
      $unset: {
        'activeMembershipPlan.isActive': '',
      },
    }
  );
}

export async function down(db) {
  await db.collection('users').updateMany(
    { activeMembershipPlan: { $exists: true } },
    {
      $set: {
        'activeMembershipPlan.isActive': false,
      },
    }
  );
}
