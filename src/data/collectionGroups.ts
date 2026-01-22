import rawGroups from './collection-groups.json';

export type CollectionGroupId =
    | 'Material'
    | 'UI 24px'
    | 'UI 16px / 32px'
    | 'UI Other / Mixed Grid'
    | 'UI Multicolor'
    | 'Programming'
    | 'Logos'
    | 'Emoji'
    | 'Flags / Maps'
    | 'Thematic'
    | 'Archive / Unmaintained';

export const GROUP_ORDER: CollectionGroupId[] = [
    'Material',
    'UI 24px',
    'UI 16px / 32px',
    'UI Other / Mixed Grid',
    'UI Multicolor',
    'Programming',
    'Logos',
    'Emoji',
    'Flags / Maps',
    'Thematic',
    'Archive / Unmaintained',
];

type CollectionGroupMap = Record<CollectionGroupId, string[]>;

const groups = rawGroups as CollectionGroupMap;

const prefixToGroup = (() => {
    const map = new Map<string, CollectionGroupId>();
    for (const groupId of GROUP_ORDER) {
        const prefixes = groups[groupId] ?? [];
        for (const prefix of prefixes) {
            if (typeof prefix === 'string' && prefix.trim().length > 0) {
                map.set(prefix.trim(), groupId);
            }
        }
    }
    return map;
})();

export const getMappedGroup = (prefix: string): CollectionGroupId | null => {
    return prefixToGroup.get(prefix) ?? null;
};

export const getGroupPrefixes = (id: CollectionGroupId): string[] => {
    return groups[id] ?? [];
};

