/**
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').MongoClient} client
 * @returns {Promise<void>}
 */
export async function up(db) {
  // Add activeMembershipPlan field to all existing users
  await db.collection('users').updateMany(
    { activeMembershipPlan: { $exists: false } },
    {
      $set: {
        activeMembershipPlan: null,
      },
    }
  );
}

/**
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').MongoClient} client
 * @returns {Promise<void>}
 */
export async function down(db) {
  // Remove activeMembershipPlan field from all users
  await db.collection('users').updateMany(
    {},
    {
      $unset: {
        activeMembershipPlan: '',
      },
    }
  );

  // Optionally, drop the membershipplans collection
  await db.collection('membershipplans').drop();
}
