import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { MOCK_VIDEOS, VideoInvite } from '../utils/mockData';

const { width } = Dimensions.get('window');

function getTimeLeft(expiresAt: Date): string {
    const diff = expiresAt.getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
}

function getPostedAgo(createdAt: Date): string {
    const diff = Date.now() - createdAt.getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
}

const VideoCard = ({ item, index }: { item: VideoInvite; index: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const [joined, setJoined] = useState(false);
    const slotsLeft = item.groupSize - item.joinedCount;
    const isFull = slotsLeft <= 0;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 120,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay: index * 120,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.card,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            {/* Video Thumbnail Placeholder */}
            <LinearGradient
                colors={[item.thumbnailColor, COLORS.bgDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.thumbnail}
            >
                <View style={styles.playButton}>
                    <Ionicons name="play" size={28} color="#FFF" />
                </View>
                <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>0:35</Text>
                </View>
                <View style={styles.expiryBadge}>
                    <Ionicons name="time-outline" size={12} color={COLORS.warning} />
                    <Text style={styles.expiryText}>{getTimeLeft(item.expiresAt)}</Text>
                </View>
            </LinearGradient>

            {/* Card Content */}
            <View style={styles.cardContent}>
                {/* User Info Row */}
                <View style={styles.userRow}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatar}>{item.user.avatar}</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.userName}>{item.user.name}</Text>
                            {item.user.verified && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
                                </View>
                            )}
                            <Text style={styles.userAge}>{item.user.age}y</Text>
                        </View>
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={12} color={COLORS.accent} />
                            <Text style={styles.locationText}>{item.location}</Text>
                            <Text style={styles.dotSeparator}>•</Text>
                            <Text style={styles.timeAgo}>{getPostedAgo(item.createdAt)}</Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <Text style={styles.description}>{item.description}</Text>

                {/* Tags */}
                <View style={styles.tagsRow}>
                    {item.tags.map((tag, i) => (
                        <View key={i} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                    <View style={[styles.tag, styles.whoTag]}>
                        <Text style={styles.tagText}>
                            {item.whoCanJoin === 'Anyone' ? '👥 Anyone' : item.whoCanJoin === 'Only Girls' ? '👩 Girls Only' : '👦 Boys Only'}
                        </Text>
                    </View>
                </View>

                {/* Bottom Row */}
                <View style={styles.bottomRow}>
                    <View style={styles.slotsInfo}>
                        <View style={styles.slotDots}>
                            {Array.from({ length: item.groupSize }).map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.slotDot,
                                        i < item.joinedCount && styles.slotDotFilled,
                                    ]}
                                />
                            ))}
                        </View>
                        <Text style={styles.slotsText}>
                            {isFull ? 'Full' : `${slotsLeft} spot${slotsLeft > 1 ? 's' : ''} left`}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.joinButton,
                            (isFull || joined) && styles.joinButtonDisabled,
                        ]}
                        onPress={() => !isFull && !joined && setJoined(true)}
                        disabled={isFull || joined}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={
                                joined
                                    ? [COLORS.success, '#34C46A']
                                    : isFull
                                        ? [COLORS.textMuted, COLORS.textMuted]
                                        : [COLORS.primary, COLORS.accent]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.joinGradient}
                        >
                            <Ionicons
                                name={joined ? 'checkmark' : isFull ? 'close' : 'hand-right'}
                                size={16}
                                color="#FFF"
                            />
                            <Text style={styles.joinText}>
                                {joined ? 'Requested' : isFull ? 'Full' : 'Join'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

export default function FeedScreen() {
    const [city] = useState('Surat');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.logo}>CROSS</Text>
                    <View style={styles.cityRow}>
                        <Ionicons name="location" size={14} color={COLORS.accent} />
                        <Text style={styles.cityText}>{city}</Text>
                        <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
                    </View>
                </View>
                <TouchableOpacity style={styles.notifButton}>
                    <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
                    <View style={styles.notifDot} />
                </TouchableOpacity>
            </View>

            {/* Live Counter */}
            <View style={styles.liveBar}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>
                    {MOCK_VIDEOS.length} invites live in {city}
                </Text>
            </View>

            {/* Feed */}
            <ScrollView
                style={styles.feed}
                contentContainerStyle={styles.feedContent}
                showsVerticalScrollIndicator={false}
            >
                {MOCK_VIDEOS.map((item, index) => (
                    <VideoCard key={item.id} item={item} index={index} />
                ))}
                <View style={styles.endMessage}>
                    <Text style={styles.endEmoji}>🌊</Text>
                    <Text style={styles.endText}>You&apos;re all caught up!</Text>
                    <Text style={styles.endSubtext}>New invites appear as people post them</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgDark,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: 52,
        paddingBottom: SPACING.md,
    },
    logo: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.textPrimary,
        letterSpacing: 3,
    },
    cityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    cityText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    notifButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.accent,
    },
    liveBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        gap: 8,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
    },
    liveText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    feed: {
        flex: 1,
    },
    feedContent: {
        paddingHorizontal: SPACING.md,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    thumbnail: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    playButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    durationText: {
        fontSize: 12,
        color: '#FFF',
        fontWeight: '600',
    },
    expiryBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    expiryText: {
        fontSize: 11,
        color: COLORS.warning,
        fontWeight: '600',
    },
    cardContent: {
        padding: SPACING.md,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    avatarContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    avatar: {
        fontSize: 24,
    },
    userInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    userName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    verifiedBadge: {
        marginLeft: 2,
    },
    userAge: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    locationText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    dotSeparator: {
        color: COLORS.textMuted,
        fontSize: 10,
    },
    timeAgo: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    description: {
        fontSize: 14,
        color: COLORS.textPrimary,
        lineHeight: 20,
        marginBottom: SPACING.sm,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: SPACING.md,
    },
    tag: {
        backgroundColor: COLORS.tagBg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
    },
    whoTag: {
        backgroundColor: 'rgba(255, 101, 132, 0.12)',
    },
    tagText: {
        fontSize: 12,
        color: COLORS.tagText,
        fontWeight: '500',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    slotsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    slotDots: {
        flexDirection: 'row',
        gap: 4,
    },
    slotDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        backgroundColor: 'transparent',
    },
    slotDotFilled: {
        backgroundColor: COLORS.primary,
    },
    slotsText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    joinButton: {
        borderRadius: RADIUS.full,
        overflow: 'hidden',
        ...SHADOWS.button,
    },
    joinButtonDisabled: {
        opacity: 0.7,
    },
    joinGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        gap: 6,
    },
    joinText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    endMessage: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    endEmoji: {
        fontSize: 36,
        marginBottom: SPACING.sm,
    },
    endText: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    endSubtext: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 4,
    },
});
