import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { ProjectPlan, savePlan } from '../lib/project-storage';

const types = ['Mobile app', 'Web app', 'Both mobile + web'];
const platforms = ['iPhone / iPad', 'Android', 'Web'];
const features = ['Accounts', 'Payments', 'Subscriptions', 'Chat', 'Notifications', 'Maps / location', 'AI features', 'Admin dashboard'];

function calculate(type: string, selectedPlatforms: string[], selectedFeatures: string[]) {
  let low = type === 'Web app' ? 1200 : type === 'Both mobile + web' ? 4200 : 2200;
  low += Math.max(0, selectedPlatforms.length - 1) * 900;
  low += selectedFeatures.length * 450;
  const complexity = selectedFeatures.filter((f) => ['Payments', 'Subscriptions', 'Chat', 'Maps / location', 'AI features'].includes(f)).length;
  low += complexity * 650;
  const weeksLow = Math.max(3, 3 + Math.ceil(selectedFeatures.length / 2) + complexity);
  return { low, high: Math.round(low * 1.65 / 100) * 100, weeksLow, weeksHigh: weeksLow + 4 + complexity };
}

export default function PlannerScreen() {
  const [name, setName] = useState(''); const [audience, setAudience] = useState(''); const [type, setType] = useState(types[0]);
  const [selectedPlatforms, setPlatforms] = useState<string[]>(['iPhone / iPad']); const [selectedFeatures, setFeatures] = useState<string[]>([]); const [notes, setNotes] = useState(''); const [error, setError] = useState('');
  const estimate = useMemo(() => calculate(type, selectedPlatforms, selectedFeatures), [type, selectedPlatforms, selectedFeatures]);
  const scopeProfile = estimate.low < 3500 ? 'Focused' : estimate.low < 6500 ? 'Advanced' : 'Complex';
  const toggle = (value:string, items:string[], setItems:(items:string[])=>void) => setItems(items.includes(value) ? items.filter(i=>i!==value) : [...items,value]);
  async function save() {
    if (name.trim().length < 2 || audience.trim().length < 3 || !selectedPlatforms.length) { setError('Add a project name, target audience, and at least one platform.'); return; }
    const now = new Date().toISOString();
    const plan: ProjectPlan = { id: `${Date.now()}`, name:name.trim(), audience:audience.trim(), type, platforms:selectedPlatforms, features:selectedFeatures, notes:notes.trim(), estimateLow:estimate.low, estimateHigh:estimate.high, weeksLow:estimate.weeksLow, weeksHigh:estimate.weeksHigh, checklist:[false,false,false,false,false], status:'Planning', tasks:[], milestones:[], budgetItems:[], createdAt:now, updatedAt:now };
    await savePlan(plan); router.replace(`/project/${plan.id}` as Href);
  }
  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS==='ios'?'padding':undefined} keyboardVerticalOffset={90}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>APP PROJECT PLANNER</Text><Text style={styles.title}>Shape your idea into a working brief.</Text><Text style={styles.intro}>Choose the essentials and get a planning range you can save, refine, and share. Estimates are directional—not a binding quote.</Text>
    <Label text="Project name"/><TextInput value={name} onChangeText={setName} placeholder="Example: Neighborhood Marketplace" placeholderTextColor="#94A3B8" style={styles.input}/>
    <Label text="Who is it for?"/><TextInput value={audience} onChangeText={setAudience} placeholder="Example: Local shoppers and small businesses" placeholderTextColor="#94A3B8" style={styles.input}/>
    <Label text="What are you building?"/><ChoiceGroup items={types} selected={[type]} onPress={setType}/>
    <Label text="Platforms"/><ChoiceGroup items={platforms} selected={selectedPlatforms} onPress={(v)=>toggle(v,selectedPlatforms,setPlatforms)}/>
    <Label text="Must-have features"/><ChoiceGroup items={features} selected={selectedFeatures} onPress={(v)=>toggle(v,selectedFeatures,setFeatures)}/>
    <Label text="Notes"/><TextInput value={notes} onChangeText={setNotes} multiline placeholder="Describe the problem, workflow, or special requirements." placeholderTextColor="#94A3B8" style={[styles.input,styles.notes]}/>
    <View style={styles.estimate}><Text style={styles.estimateLabel}>SCOPE PROFILE</Text><Text style={styles.estimateMoney}>{scopeProfile}</Text><Text style={styles.estimateTime}>{estimate.weeksLow}–{estimate.weeksHigh} week planning window</Text><Text style={styles.estimateNote}>This directional profile reflects platform and feature complexity. Track your own delivery expenses later inside the project workspace.</Text></View>
    {!!error&&<Text accessibilityRole="alert" style={styles.error}>{error}</Text>}<Pressable onPress={save} style={styles.save}><Text style={styles.saveText}>Save project brief</Text></Pressable>
  </ScrollView></KeyboardAvoidingView>;
}
function Label({text}:{text:string}){return <Text style={styles.label}>{text}</Text>}
function ChoiceGroup({items,selected,onPress}:{items:string[];selected:string[];onPress:(item:string)=>void}){return <View style={styles.choices}>{items.map(item=><Pressable key={item} onPress={()=>onPress(item)} accessibilityRole="checkbox" accessibilityState={{checked:selected.includes(item)}} style={[styles.choice,selected.includes(item)&&styles.choiceOn]}><Text style={[styles.choiceText,selected.includes(item)&&styles.choiceTextOn]}>{selected.includes(item)?'✓ ':''}{item}</Text></Pressable>)}</View>}
const styles=StyleSheet.create({flex:{flex:1,backgroundColor:'#F8FAFC'},content:{padding:24,paddingBottom:60},eyebrow:{color:'#9A6B00',fontSize:12,fontWeight:'900',letterSpacing:1.4},title:{color:'#111827',fontSize:34,lineHeight:40,fontWeight:'900',marginTop:8},intro:{color:'#475569',fontSize:16,lineHeight:25,marginTop:12,marginBottom:12},label:{color:'#1E293B',fontSize:15,fontWeight:'800',marginTop:22,marginBottom:9},input:{backgroundColor:'#FFF',borderColor:'#CBD5E1',borderWidth:1,borderRadius:12,padding:15,color:'#0F172A',fontSize:16},notes:{minHeight:110,textAlignVertical:'top'},choices:{flexDirection:'row',flexWrap:'wrap',gap:9},choice:{borderWidth:1,borderColor:'#CBD5E1',backgroundColor:'#FFF',paddingHorizontal:14,paddingVertical:11,borderRadius:999},choiceOn:{borderColor:'#111827',backgroundColor:'#111827'},choiceText:{color:'#334155',fontSize:14,fontWeight:'700'},choiceTextOn:{color:'#FFF'},estimate:{backgroundColor:'#FFFBEB',borderColor:'#F4C95D',borderWidth:1,borderRadius:18,padding:20,marginTop:28},estimateLabel:{color:'#8A6200',fontSize:11,fontWeight:'900',letterSpacing:1.3},estimateMoney:{color:'#111827',fontSize:28,fontWeight:'900',marginTop:8},estimateTime:{color:'#334155',fontSize:17,fontWeight:'800',marginTop:5},estimateNote:{color:'#64748B',fontSize:12,lineHeight:18,marginTop:10},error:{color:'#991B1B',backgroundColor:'#FEE2E2',padding:12,borderRadius:10,marginTop:16},save:{backgroundColor:'#111827',padding:17,borderRadius:14,alignItems:'center',marginTop:18},saveText:{color:'#FFF',fontSize:17,fontWeight:'900'}});
