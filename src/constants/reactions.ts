// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// REACTION CONSTANTS
// Version: 2026.09
// ============================================================

/**
 * Система реакций Tajik Opportunities.
 *
 * Поддерживает:
 * - Like
 * - Love
 * - Useful
 * - Support
 * - Interesting
 * - Congratulations
 * - Sad
 * - Angry
 * - Custom reactions
 *
 * Администратор сможет управлять реакциями:
 * - видеть все реакции;
 * - добавлять;
 * - изменять;
 * - отключать;
 * - удалять;
 * - менять название;
 * - менять emoji;
 * - менять порядок;
 * - изменять счётчики;
 * - вручную добавлять/удалять реакцию.
 *
 * ВАЖНО:
 * Значения ключей используются в БД и API.
 * Не изменяй существующие ключи после запуска системы.
 */

// ============================================================
// REACTION TYPES
// ============================================================

export const REACTION_TYPES = {
  LIKE: "like",
  LOVE: "love",
  USEFUL: "useful",
  SUPPORT: "support",
  INTERESTING: "interesting",
  CONGRATULATIONS: "congratulations",
  SAD: "sad",
  ANGRY: "angry",
  WOW: "wow",
  CELEBRATE: "celebrate",
  THANKS: "thanks",
} as const;

export type ReactionType =
  typeof REACTION_TYPES[keyof typeof REACTION_TYPES];

// ============================================================
// DEFAULT REACTION DEFINITIONS
// ============================================================

export interface ReactionDefinition {
  key: ReactionType;
  name: string;
  nameTj: string;
  emoji: string;
  icon: string;
  description: string;
  descriptionTj: string;
  enabled: boolean;
  isPositive: boolean;
  sortOrder: number;
}

export const DEFAULT_REACTIONS: readonly ReactionDefinition[] = [
  {
    key: "like",
    name: "Нравится",
    nameTj: "Маъқул",
    emoji: "👍",
    icon: "thumb-up",
    description: "Пользователю нравится публикация.",
    descriptionTj: "Ба корбар нашрия маъқул аст.",
    enabled: true,
    isPositive: true,
    sortOrder: 10,
  },

  {
    key: "love",
    name: "Любовь",
    nameTj: "Муҳаббат",
    emoji: "❤️",
    icon: "heart",
    description: "Публикация очень понравилась пользователю.",
    descriptionTj: "Нашрия ба корбар хеле маъқул шуд.",
    enabled: true,
    isPositive: true,
    sortOrder: 20,
  },

  {
    key: "useful",
    name: "Полезно",
    nameTj: "Муфид",
    emoji: "💡",
    icon: "lightbulb",
    description: "Пользователь считает информацию полезной.",
    descriptionTj: "Корбар маълумотро муфид мешуморад.",
    enabled: true,
    isPositive: true,
    sortOrder: 30,
  },

  {
    key: "support",
    name: "Поддерживаю",
    nameTj: "Дастгирӣ мекунам",
    emoji: "🤝",
    icon: "handshake",
    description: "Пользователь поддерживает публикацию.",
    descriptionTj: "Корбар нашрияро дастгирӣ мекунад.",
    enabled: true,
    isPositive: true,
    sortOrder: 40,
  },

  {
    key: "interesting",
    name: "Интересно",
    nameTj: "Ҷолиб",
    emoji: "👀",
    icon: "eye",
    description: "Публикация показалась пользователю интересной.",
    descriptionTj: "Нашрия барои корбар ҷолиб аст.",
    enabled: true,
    isPositive: true,
    sortOrder: 50,
  },

  {
    key: "congratulations",
    name: "Поздравляю",
    nameTj: "Табрик",
    emoji: "🎉",
    icon: "party-popper",
    description: "Пользователь поздравляет автора или участника.",
    descriptionTj: "Корбар муаллиф ё иштирокчиро табрик мекунад.",
    enabled: true,
    isPositive: true,
    sortOrder: 60,
  },

  {
    key: "sad",
    name: "Грустно",
    nameTj: "Афсӯс",
    emoji: "😢",
    icon: "sad",
    description: "Пользователь выражает сожаление или грусть.",
    descriptionTj: "Корбар ғамгинӣ ё афсӯсро баён мекунад.",
    enabled: true,
    isPositive: false,
    sortOrder: 70,
  },

  {
    key: "angry",
    name: "Злюсь",
    nameTj: "Хашмгин",
    emoji: "😡",
    icon: "angry",
    description: "Пользователь выражает негативную реакцию.",
    descriptionTj: "Корбар вокуниши манфӣ нишон медиҳад.",
    enabled: true,
    isPositive: false,
    sortOrder: 80,
  },

  {
    key: "wow",
    name: "Вау",
    nameTj: "Вау",
    emoji: "😮",
    icon: "surprised",
    description: "Публикация сильно удивила пользователя.",
    descriptionTj: "Нашрия корбарро хеле ҳайрон кард.",
    enabled: true,
    isPositive: true,
    sortOrder: 90,
  },

  {
    key: "celebrate",
    name: "Праздную",
    nameTj: "Ҷашн мегирам",
    emoji: "🥳",
    icon: "celebrate",
    description: "Пользователь отмечает хорошее событие.",
    descriptionTj: "Корбар рӯйдоди хубро ҷашн мегирад.",
    enabled: true,
    isPositive: true,
    sortOrder: 100,
  },

  {
    key: "thanks",
    name: "Спасибо",
    nameTj: "Ташаккур",
    emoji: "🙏",
    icon: "hands",
    description: "Пользователь благодарит автора.",
    descriptionTj: "Корбар ба муаллиф ташаккур мегӯяд.",
    enabled: true,
    isPositive: true,
    sortOrder: 110,
  },
] as const;

// ============================================================
// REACTION LABELS
// ============================================================

export const REACTION_LABELS: Record<
  ReactionType,
  string
> = {
  like: "Нравится",
  love: "Любовь",
  useful: "Полезно",
  support: "Поддерживаю",
  interesting: "Интересно",
  congratulations: "Поздравляю",
  sad: "Грустно",
  angry: "Злюсь",
  wow: "Вау",
  celebrate: "Праздную",
  thanks: "Спасибо",
};

export const REACTION_LABELS_TJ: Record<
  ReactionType,
  string
> = {
  like: "Маъқул",
  love: "Муҳаббат",
  useful: "Муфид",
  support: "Дастгирӣ мекунам",
  interesting: "Ҷолиб",
  congratulations: "Табрик",
  sad: "Афсӯс",
  angry: "Хашмгин",
  wow: "Вау",
  celebrate: "Ҷашн мегирам",
  thanks: "Ташаккур",
};

// ============================================================
// REACTION EMOJIS
// ============================================================

export const REACTION_EMOJIS: Record<
  ReactionType,
  string
> = {
  like: "👍",
  love: "❤️",
  useful: "💡",
  support: "🤝",
  interesting: "👀",
  congratulations: "🎉",
  sad: "😢",
  angry: "😡",
  wow: "😮",
  celebrate: "🥳",
  thanks: "🙏",
};

// ============================================================
// REACTION ICONS
// ============================================================

export const REACTION_ICONS: Record<
  ReactionType,
  string
> = {
  like: "thumb-up",
  love: "heart",
  useful: "lightbulb",
  support: "handshake",
  interesting: "eye",
  congratulations: "party-popper",
  sad: "sad",
  angry: "angry",
  wow: "surprised",
  celebrate: "celebrate",
  thanks: "hands",
};

// ============================================================
// REACTION GROUPS
// ============================================================

export const POSITIVE_REACTIONS: readonly ReactionType[] = [
  "like",
  "love",
  "useful",
  "support",
  "interesting",
  "congratulations",
  "wow",
  "celebrate",
  "thanks",
];

export const NEGATIVE_REACTIONS: readonly ReactionType[] = [
  "sad",
  "angry",
];

// ============================================================
// VALIDATION
// ============================================================

export const ALL_REACTION_TYPES =
  Object.values(REACTION_TYPES);

export function isValidReactionType(
  value: string
): value is ReactionType {
  return ALL_REACTION_TYPES.includes(
    value as ReactionType
  );
}

export function isPositiveReaction(
  type: ReactionType
): boolean {
  return POSITIVE_REACTIONS.includes(type);
}

export function isNegativeReaction(
  type: ReactionType
): boolean {
  return NEGATIVE_REACTIONS.includes(type);
}

// ============================================================
// REACTION DEFINITION HELPERS
// ============================================================

export function getReactionDefinition(
  type: ReactionType
): ReactionDefinition | undefined {
  return DEFAULT_REACTIONS.find(
    (reaction) => reaction.key === type
  );
}

export function getReactionLabel(
  type: ReactionType,
  language: "ru" | "tj" = "ru"
): string {
  if (language === "tj") {
    return REACTION_LABELS_TJ[type];
  }

  return REACTION_LABELS[type];
}

export function getReactionEmoji(
  type: ReactionType
): string {
  return REACTION_EMOJIS[type];
}

export function getReactionIcon(
  type: ReactionType
): string {
  return REACTION_ICONS[type];
}

// ============================================================
// REACTION ORDER
// ============================================================

export const DEFAULT_REACTION_ORDER: readonly ReactionType[] = [
  "like",
  "love",
  "useful",
  "support",
  "interesting",
  "congratulations",
  "wow",
  "celebrate",
  "thanks",
  "sad",
  "angry",
];

// ============================================================
// ADMIN REACTION CONTROLS
// ============================================================

export const REACTION_ADMIN_ACTIONS = {
  VIEW: "view",
  SEARCH: "search",
  ADD: "add",
  EDIT: "edit",
  DELETE: "delete",
  RESTORE: "restore",
  ENABLE: "enable",
  DISABLE: "disable",
  REORDER: "reorder",

  SET_COUNT: "set_count",
  INCREMENT_COUNT: "increment_count",
  DECREMENT_COUNT: "decrement_count",
  RESET_COUNT: "reset_count",

  ADD_TO_PUBLICATION: "add_to_publication",
  REMOVE_FROM_PUBLICATION: "remove_from_publication",

  CHANGE_TYPE: "change_type",
  CHANGE_AUTHOR: "change_author",
  CHANGE_DATE: "change_date",
} as const;

export type ReactionAdminAction =
  typeof REACTION_ADMIN_ACTIONS[
    keyof typeof REACTION_ADMIN_ACTIONS
  ];

// ============================================================
// REACTION COUNTER TYPES
// ============================================================

export const REACTION_COUNTER_TYPES = {
  TOTAL: "total",
  UNIQUE: "unique",
  BY_TYPE: "by_type",
} as const;

export type ReactionCounterType =
  typeof REACTION_COUNTER_TYPES[
    keyof typeof REACTION_COUNTER_TYPES
  ];

// ============================================================
// REACTION SOURCES
// ============================================================

export const REACTION_SOURCES = {
  USER: "user",
  ADMIN: "admin",
  SYSTEM: "system",
  IMPORT: "import",
  MIGRATION: "migration",
} as const;

export type ReactionSource =
  typeof REACTION_SOURCES[
    keyof typeof REACTION_SOURCES
  ];

// ============================================================
// REACTION TARGET TYPES
// ============================================================

export const REACTION_TARGET_TYPES = {
  PUBLICATION: "publication",
  COMMENT: "comment",
  PROFILE: "profile",
  MESSAGE: "message",
} as const;

export type ReactionTargetType =
  typeof REACTION_TARGET_TYPES[
    keyof typeof REACTION_TARGET_TYPES
  ];

// ============================================================
// REACTION ACTION RESULT
// ============================================================

export const REACTION_ACTION_RESULTS = {
  ADDED: "added",
  REMOVED: "removed",
  UPDATED: "updated",
  ALREADY_EXISTS: "already_exists",
  NOT_FOUND: "not_found",
  DISABLED: "disabled",
  FORBIDDEN: "forbidden",
} as const;

export type ReactionActionResult =
  typeof REACTION_ACTION_RESULTS[
    keyof typeof REACTION_ACTION_RESULTS
  ];

// ============================================================
// DEFAULT LIMITS
// ============================================================

export const REACTION_LIMITS = {
  MAX_REACTIONS_PER_USER_PER_TARGET: 1,
  MAX_CUSTOM_REACTIONS_PER_ADMIN: 1000,
  MAX_REACTION_TYPES: 1000,
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 200,
} as const;

// ============================================================
// DISPLAY SETTINGS
// ============================================================

export const REACTION_DISPLAY = {
  SHOW_TOTAL_COUNT: true,
  SHOW_TYPE_COUNTS: true,
  SHOW_USER_REACTION: true,
  SHOW_EMOJI: true,
  SHOW_LABEL: true,
  MAX_VISIBLE_TYPES: 5,
} as const;

// ============================================================
// END
// ============================================================
