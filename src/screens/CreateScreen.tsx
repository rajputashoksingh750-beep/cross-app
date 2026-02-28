import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TAGS, GROUP_SIZES, WHO_CAN_JOIN } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function CreateScreen() {
    const [step, setStep] = useState(0); // 0=record, 1=tags, 2=settings
    const [recording, setRecording] = useState(false);
    const [recorded, setRecorded] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [groupSize, setGroupSize] = useState(2);
    const [whoCanJoin, setWhoCanJoin] = useState('Anyone');
    const [timer, setTimer] = useState(0);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 3 ? [...prev, tag] : prev
        );
    };

    const handleRecord = () => {
        if (!recording && !recorded) {
            setRecording(true);
            let t = 0;
            const interval = setInterval(() => {
                t += 1;
                setTimer(t);
                if (t >= 35) {
                    clearInterval(interval);
                    setRecording(false);
                    setRecorded(true);
                }
            }, 1000);
        } else if (recording) {
            setRecording(false);
            setRecorded(true);
        }
    };

    const handlePost = () => {
        Alert.alert('🎉 Invite Posted!', 'Your invite is now live in Surat!\nIt will expire in 2 hours.', [
            { text: 'Awesome!', onPress: () => { setStep(0); setRecorded(false); setRecording(false); setTimer(0); setSelectedTags([]); } }
        ]);
    };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={s.title}>Create Invite</Text>
                <Text style={s.subtitle}>3 invites left today</Text>
            </View>

            {/* Step Indicator */}
            <View style={s.steps}>
                {['Record', 'Tags', 'Settings'].map((label, i) => (
                    <View key={i} style={s.stepItem}>
                        <View style={[s.stepDot, step >= i && s.stepDotActive]}>
                            <Text style={[s.stepNum, step >= i && s.stepNumActive]}>{i + 1}</Text>
                        </View>
                        <Text style={[s.stepLabel, step >= i && s.stepLabelActive]}>{label}</Text>
                        {i < 2 && <View style={[s.stepLine, step > i && s.stepLineActive]} />}
                    </View>
                ))}
            </View>

            {step === 0 && (
                <View style={s.recordSection}>
                    <View style={s.cameraBox}>
                        <LinearGradient colors={[COLORS.bgCard, COLORS.surface]} style={s.cameraPreview}>
                            {!recorded ? (
                                <>
                                    <Ionicons name="videocam" size={48} color={COLORS.textMuted} />
                                    <Text style={s.cameraHint}>{recording ? 'Recording...' : 'Tap to record your invite'}</Text>
                                    {recording && <Text style={s.timerText}>{`0:${timer.toString().padStart(2, '0')} / 0:40`}</Text>}
                                    {recording && (
                                        <View style={s.timerBar}>
                                            <View style={[s.timerFill, { width: `${(timer / 40) * 100}%` }]} />
                                        </View>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={56} color={COLORS.success} />
                                    <Text style={s.recordedText}>Video Recorded!</Text>
                                    <Text style={s.recordedDuration}>{`0:${timer.toString().padStart(2, '0')}`}</Text>
                                    <TouchableOpacity style={s.retakeBtn} onPress={() => { setRecorded(false); setTimer(0); }}>
                                        <Ionicons name="refresh" size={16} color={COLORS.accent} />
                                        <Text style={s.retakeText}>Retake</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </LinearGradient>
                    </View>

                    <TouchableOpacity style={s.recButton} onPress={handleRecord} activeOpacity={0.7}>
                        <View style={[s.recOuter, recording && s.recOuterActive]}>
                            <View style={[s.recInner, recording && s.recInnerSquare]} />
                        </View>
                    </TouchableOpacity>
                    <Text style={s.recHint}>{recording ? 'Tap to stop' : recorded ? 'Video ready ✓' : '30-40 seconds • Live only'}</Text>

                    {recorded && (
                        <TouchableOpacity style={s.nextBtn} onPress={() => setStep(1)} activeOpacity={0.7}>
                            <LinearGradient colors={[COLORS.primary, COLORS.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.nextGradient}>
                                <Text style={s.nextText}>Next</Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {step === 1 && (
                <ScrollView style={s.tagsSection} showsVerticalScrollIndicator={false}>
                    <Text style={s.sectionTitle}>Add Tags (up to 3)</Text>
                    <View style={s.tagsGrid}>
                        {TAGS.map(tag => (
                            <TouchableOpacity key={tag} style={[s.tagChip, selectedTags.includes(tag) && s.tagChipActive]}
                                onPress={() => toggleTag(tag)} activeOpacity={0.7}>
                                <Text style={[s.tagChipText, selectedTags.includes(tag) && s.tagChipTextActive]}>{tag}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={s.nextBtn} onPress={() => setStep(2)} activeOpacity={0.7}>
                        <LinearGradient colors={[COLORS.primary, COLORS.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.nextGradient}>
                            <Text style={s.nextText}>Next</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {step === 2 && (
                <ScrollView style={s.settingsSection} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                    <Text style={s.sectionTitle}>Who can join?</Text>
                    <View style={s.optionRow}>
                        {WHO_CAN_JOIN.map(w => (
                            <TouchableOpacity key={w} style={[s.optionBtn, whoCanJoin === w && s.optionBtnActive]}
                                onPress={() => setWhoCanJoin(w)} activeOpacity={0.7}>
                                <Text style={s.optionIcon}>{w === 'Anyone' ? '👥' : w === 'Only Girls' ? '👩' : '👦'}</Text>
                                <Text style={[s.optionText, whoCanJoin === w && s.optionTextActive]}>{w}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.sectionTitle}>Group Size</Text>
                    <View style={s.sizeRow}>
                        {GROUP_SIZES.map(n => (
                            <TouchableOpacity key={n} style={[s.sizeBtn, groupSize === n && s.sizeBtnActive]}
                                onPress={() => setGroupSize(n)} activeOpacity={0.7}>
                                <Text style={[s.sizeText, groupSize === n && s.sizeTextActive]}>{n}</Text>
                                <Text style={s.sizeLabel}>{n === 1 ? 'person' : 'people'}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={s.summaryBox}>
                        <Text style={s.summaryTitle}>📋 Summary</Text>
                        <Text style={s.summaryItem}>Tags: {selectedTags.length > 0 ? selectedTags.join(', ') : 'None'}</Text>
                        <Text style={s.summaryItem}>Who: {whoCanJoin}</Text>
                        <Text style={s.summaryItem}>Group: {groupSize} {groupSize === 1 ? 'person' : 'people'}</Text>
                        <Text style={s.summaryItem}>Expires: 2 hours</Text>
                    </View>

                    <TouchableOpacity style={s.postBtn} onPress={handlePost} activeOpacity={0.7}>
                        <LinearGradient colors={[COLORS.primary, COLORS.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.postGradient}>
                            <Ionicons name="rocket" size={20} color="#FFF" />
                            <Text style={s.postText}>Post Invite</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {step > 0 && (
                <TouchableOpacity style={s.backBtn} onPress={() => setStep(step - 1)}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgDark },
    header: { paddingHorizontal: SPACING.lg, paddingTop: 52, paddingBottom: SPACING.sm },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
    subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
    steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
    stepItem: { flexDirection: 'row', alignItems: 'center' },
    stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
    stepDotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    stepNum: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
    stepNumActive: { color: '#FFF' },
    stepLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500', marginLeft: 4, marginRight: 4 },
    stepLabelActive: { color: COLORS.primary },
    stepLine: { width: 24, height: 2, backgroundColor: COLORS.border, marginHorizontal: 2 },
    stepLineActive: { backgroundColor: COLORS.primary },
    recordSection: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.md },
    cameraBox: { width: '100%', height: 280, borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.lg },
    cameraPreview: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    cameraHint: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
    timerText: { fontSize: 24, color: COLORS.accent, fontWeight: '800', fontVariant: ['tabular-nums'] },
    timerBar: { width: '70%', height: 4, backgroundColor: COLORS.surface, borderRadius: 2, overflow: 'hidden' },
    timerFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 2 },
    recordedText: { fontSize: 18, color: COLORS.success, fontWeight: '700' },
    recordedDuration: { fontSize: 14, color: COLORS.textSecondary },
    retakeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,101,132,0.12)' },
    retakeText: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
    recButton: { marginBottom: SPACING.sm },
    recOuter: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },
    recOuterActive: { borderColor: COLORS.danger },
    recInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.accent },
    recInnerSquare: { borderRadius: 8, backgroundColor: COLORS.danger, width: 28, height: 28 },
    recHint: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
    nextBtn: { marginTop: SPACING.lg, borderRadius: 999, overflow: 'hidden', alignSelf: 'center' },
    nextGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 14, gap: 8 },
    nextText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    tagsSection: { flex: 1, paddingHorizontal: SPACING.md },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md, marginTop: SPACING.sm },
    tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tagChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
    tagChipActive: { backgroundColor: 'rgba(108,99,255,0.2)', borderColor: COLORS.primary },
    tagChipText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
    tagChipTextActive: { color: COLORS.primary },
    settingsSection: { flex: 1, paddingHorizontal: SPACING.md },
    optionRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
    optionBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, gap: 4 },
    optionBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(108,99,255,0.15)' },
    optionIcon: { fontSize: 22 },
    optionText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
    optionTextActive: { color: COLORS.primary },
    sizeRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
    sizeBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
    sizeBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(108,99,255,0.15)' },
    sizeText: { fontSize: 20, fontWeight: '800', color: COLORS.textSecondary },
    sizeTextActive: { color: COLORS.primary },
    sizeLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
    summaryBox: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
    summaryTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
    summaryItem: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 22 },
    postBtn: { borderRadius: 999, overflow: 'hidden', alignSelf: 'center', marginBottom: SPACING.xl },
    postGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 16, gap: 10 },
    postText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
    backBtn: { position: 'absolute', top: 52, right: SPACING.lg, width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
});
