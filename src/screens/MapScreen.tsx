import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Dimensions, Animated, Switch, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { MOCK_MAP_PINS, MOCK_NEARBY_USERS } from '../utils/mockData';
import { getActiveInvitesByCity } from '../utils/firebaseService';

const { width } = Dimensions.get('window');

function getTimeLeftPin(d: Date) {
    const diff = d.getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const h = Math.floor(diff / 3600000);
    return h > 0 ? `${h}h left` : `${Math.floor(diff / 60000)}m left`;
}

export default function MapScreen() {
    const [nearbyNow, setNearbyNow] = useState(false);
    const [activeTab, setActiveTab] = useState<'pins' | 'nearby'>('pins');
    const [loading, setLoading] = useState(true);
    const [liveUsersCount, setLiveUsersCount] = useState(0);

    useEffect(() => {
        // Quick fetch to see how many people have active invites right now
        const fetchStats = async () => {
            setLoading(true);
            const active = await getActiveInvitesByCity('Surat');
            setLiveUsersCount(active.length);
            setLoading(false);
        };
        fetchStats();
    }, []);

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={s.title}>Map</Text>
                <View style={s.toggle}>
                    <Text style={s.toggleLabel}>Nearby Now</Text>
                    <Switch value={nearbyNow} onValueChange={setNearbyNow}
                        trackColor={{ false: COLORS.surface, true: COLORS.primary }}
                        thumbColor={nearbyNow ? '#FFF' : COLORS.textMuted} />
                </View>
            </View>

            {nearbyNow && (
                <View style={s.statusBar}>
                    <View style={s.liveDot} />
                    <Text style={s.statusText}>You're visible for 30 minutes</Text>
                </View>
            )}

            <View style={s.mapBox}>
                <View style={s.mapGrid}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <View key={i} style={s.gridCell} />
                    ))}
                </View>

                {/* Memory Pins on Map */}
                {MOCK_MAP_PINS.map((pin, i) => (
                    <View key={pin.id} style={[s.marker, { left: 30 + i * ((width - 100) / 3), top: 30 + (i % 2 === 0 ? 20 : 80) }]}>
                        <Ionicons name="location" size={28} color={COLORS.accent} />
                        <Text style={s.markerName}>{pin.user.name}</Text>
                    </View>
                ))}

                {/* Nearby Users Bubbles (Active Invites simulated as Nearby Users for now) */}
                {nearbyNow && MOCK_NEARBY_USERS.map((u, i) => (
                    <View key={u.id} style={[s.nearbyBubble, { left: 40 + i * ((width - 120) / 3), top: 60 + (i % 2 === 0 ? 0 : 40) }]}>
                        <Text style={{ fontSize: 20 }}>{u.avatar}</Text>
                        <Text style={s.bubbleName}>{u.name}</Text>
                    </View>
                ))}

                <View style={s.youMarker}>
                    <View style={s.youOuter}><View style={s.youInner} /></View>
                    <Text style={s.youLabel}>You</Text>
                </View>
                <View style={s.cityBadge}><Text style={s.cityText}>📍 Surat {liveUsersCount > 0 ? `(${liveUsersCount} live)` : ''}</Text></View>
            </View>

            <View style={s.tabs}>
                {(['pins', 'nearby'] as const).map(t => (
                    <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)}>
                        <Ionicons name={t === 'pins' ? 'pin' : 'people'} size={16} color={activeTab === t ? COLORS.primary : COLORS.textMuted} />
                        <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>
                            {t === 'pins' ? `Memory Pins (${MOCK_MAP_PINS.length})` : `Nearby (${loading ? '...' : (MOCK_NEARBY_USERS.length + liveUsersCount)})`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={s.list} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                ) : activeTab === 'pins' ? (
                    MOCK_MAP_PINS.map(pin => (
                        <View key={pin.id} style={s.card}>
                            <View style={s.cardHeader}>
                                <View style={s.avatar}><Text style={{ fontSize: 20 }}>{pin.user.avatar}</Text></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.cardName}>{pin.user.name}</Text>
                                    <View style={s.timeRow}>
                                        <Ionicons name="time-outline" size={11} color={COLORS.warning} />
                                        <Text style={s.timeText}>{getTimeLeftPin(pin.expiresAt)}</Text>
                                    </View>
                                </View>
                                {pin.hasPhoto && <View style={s.photoBadge}><Ionicons name="image" size={14} color={COLORS.primary} /></View>}
                            </View>
                            <Text style={s.note}>{pin.note}</Text>
                            <TouchableOpacity style={s.respondBtn} activeOpacity={0.7}>
                                <Ionicons name="chatbubble-ellipses" size={14} color={COLORS.primary} />
                                <Text style={s.respondText}>Respond</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    MOCK_NEARBY_USERS.map(u => (
                        <View key={u.id} style={s.nearbyCard}>
                            <View style={s.nearbyAvatar}><Text style={{ fontSize: 28 }}>{u.avatar}</Text></View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.cardName}>{u.name}</Text>
                                <Text style={s.openText}>Open to meet</Text>
                            </View>
                            <TouchableOpacity style={s.waveBtn}><Text style={s.waveText}>👋 Wave</Text></TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgDark },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: 52, paddingBottom: SPACING.sm },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
    toggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    toggleLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
    statusBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(74,222,128,0.1)', paddingVertical: 8, marginHorizontal: SPACING.lg, borderRadius: RADIUS.md, gap: 8 },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
    statusText: { fontSize: 13, color: COLORS.success, fontWeight: '600' },
    mapBox: { height: 220, marginHorizontal: SPACING.md, marginTop: SPACING.sm, borderRadius: RADIUS.lg, overflow: 'hidden', backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, position: 'relative' },
    mapGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
    gridCell: { width: '25%', height: '33.33%', borderWidth: 0.5, borderColor: 'rgba(108,99,255,0.08)' },
    marker: { position: 'absolute', alignItems: 'center' },
    markerName: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '500' },
    nearbyBubble: { position: 'absolute', alignItems: 'center', backgroundColor: 'rgba(74,222,128,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
    bubbleName: { fontSize: 10, color: COLORS.success, fontWeight: '600' },
    youMarker: { position: 'absolute', alignSelf: 'center', top: '40%', alignItems: 'center' },
    youOuter: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(108,99,255,0.3)', justifyContent: 'center', alignItems: 'center' },
    youInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
    youLabel: { fontSize: 10, color: COLORS.primary, fontWeight: '700', marginTop: 2 },
    cityBadge: { position: 'absolute', bottom: 10, left: 12, zIndex: 10 },
    cityText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.sm, overflow: 'hidden' },
    tabs: { flexDirection: 'row', marginHorizontal: SPACING.md, marginTop: SPACING.md, gap: 8 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard, gap: 6, borderWidth: 1, borderColor: COLORS.border },
    tabActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(108,99,255,0.1)' },
    tabText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
    tabTextActive: { color: COLORS.primary },
    list: { flex: 1, marginTop: SPACING.sm },
    listContent: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
    card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
    cardName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeText: { fontSize: 11, color: COLORS.warning, fontWeight: '500' },
    photoBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(108,99,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    note: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20, marginBottom: SPACING.sm },
    respondBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(108,99,255,0.15)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, gap: 6 },
    respondText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
    nearbyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
    nearbyAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(74,222,128,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    openText: { fontSize: 12, color: COLORS.success, fontWeight: '500' },
    waveBtn: { backgroundColor: 'rgba(108,99,255,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
    waveText: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
});
