async registerShare(
  publicationId: string,
  options: {
    userId?: string;
    visitorId?: string;
    sessionId?: string;
    shareType?: string;
    targetConversationId?: string;
    targetUserId?: string;
    source?: string;
  } = {}
): Promise<string> {
  const generated = generateId();

  if (
    generated === null ||
    generated === undefined
  ) {
    throw new Error(
      "Не удалось сгенерировать ID события share"
    );
  }

  const id =
    generated as string;

  await this.db
    .prepare(`
      INSERT INTO publication_share_events (
        id,
        publication_id,
        user_id,
        visitor_id,
        session_id,
        share_type,
        target_conversation_id,
        target_user_id,
        source,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      publicationId,

      nullableString(
        options.userId
      ),

      nullableString(
        options.visitorId
      ),

      nullableString(
        options.sessionId
      ),

      nullableString(
        options.shareType
      ) ||
        "share",

      nullableString(
        options.targetConversationId
      ),

      nullableString(
        options.targetUserId
      ),

      nullableString(
        options.source
      ) ||
        "publication",

      now()
    )
    .run();

  await this.incrementMetric(
    publicationId,
    "shares_count",
    "1"
  );

  return id;
}
