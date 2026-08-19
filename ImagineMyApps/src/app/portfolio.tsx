import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { featuredProject, portfolioProjects } from '../data/portfolio';

export default function PortfolioScreen() {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <SafeAreaView edges={['top']} style={styles.header}>
      <Text style={styles.eyebrow}>OUR WORK</Text><Text style={styles.title}>Apps built to solve real problems.</Text>
      <Text style={styles.intro}>Explore our product work and open any project for the full case study.</Text>
    </SafeAreaView>
    <View style={[styles.featured, { borderColor: featuredProject.accent }]}>
      <View style={styles.featuredLabel}><Text style={styles.featuredLabelText}>FEATURED APP</Text></View>
      <Image source={featuredProject.image} style={styles.featuredImage} resizeMode="cover" />
      <View style={styles.cardBody}><Text style={styles.featuredTitle}>{featuredProject.name}</Text><Text style={styles.tagline}>{featuredProject.tagline}</Text><Text style={styles.summary}>{featuredProject.summary}</Text>
        <Link href={`/case-study/${featuredProject.slug}` as Href} asChild><Pressable style={[styles.button,{backgroundColor:featuredProject.accent}]}><Text style={styles.buttonText}>Explore the flagship case study</Text></Pressable></Link>
      </View>
    </View>
    <Text style={styles.sectionTitle}>Complete portfolio</Text>
    {portfolioProjects.slice(1).map(project => <View key={project.slug} style={styles.card}><Image source={project.image} style={styles.cardImage} resizeMode="cover"/><View style={styles.cardBody}><Text style={styles.cardTitle}>{project.name}</Text><Text style={styles.tagline}>{project.tagline}</Text><Text style={styles.summary} numberOfLines={3}>{project.summary}</Text><Link href={`/case-study/${project.slug}` as Href} asChild><Pressable style={styles.outlineButton}><Text style={styles.outlineButtonText}>View case study →</Text></Pressable></Link></View></View>)}
  </ScrollView>;
}

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#F8FAFC'},content:{paddingBottom:44},header:{backgroundColor:'#111827',paddingHorizontal:22,paddingBottom:34},eyebrow:{color:'#F4C95D',fontSize:12,fontWeight:'900',letterSpacing:1.5,marginTop:18},title:{color:'#FFF',fontSize:36,lineHeight:41,fontWeight:'900',marginTop:10},intro:{color:'#CBD5E1',fontSize:16,lineHeight:24,marginTop:12},featured:{margin:20,backgroundColor:'#FFF',borderWidth:2,borderRadius:20,overflow:'hidden'},featuredLabel:{position:'absolute',zIndex:2,top:14,left:14,backgroundColor:'#111827',paddingHorizontal:12,paddingVertical:7,borderRadius:999},featuredLabelText:{color:'#F4C95D',fontSize:11,fontWeight:'900',letterSpacing:1},featuredImage:{width:'100%',height:245,backgroundColor:'#E2E8F0'},cardBody:{padding:20},featuredTitle:{color:'#111827',fontSize:27,fontWeight:'900'},tagline:{color:'#334155',fontSize:15,fontWeight:'800',marginTop:6},summary:{color:'#64748B',fontSize:15,lineHeight:23,marginTop:10},button:{marginTop:18,borderRadius:12,padding:15,alignItems:'center'},buttonText:{color:'#FFF',fontSize:15,fontWeight:'900'},sectionTitle:{color:'#111827',fontSize:25,fontWeight:'900',marginHorizontal:20,marginTop:12,marginBottom:14},card:{marginHorizontal:20,marginBottom:16,backgroundColor:'#FFF',borderRadius:18,overflow:'hidden',borderWidth:1,borderColor:'#E2E8F0'},cardImage:{width:'100%',height:190,backgroundColor:'#E2E8F0'},cardTitle:{color:'#111827',fontSize:22,fontWeight:'900'},outlineButton:{marginTop:17,borderColor:'#111827',borderWidth:2,borderRadius:11,padding:13,alignItems:'center'},outlineButtonText:{color:'#111827',fontSize:15,fontWeight:'900'}});
