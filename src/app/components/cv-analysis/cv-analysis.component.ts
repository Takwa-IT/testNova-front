import { Component, ViewChild, ElementRef, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { CvAnalysis, Skill, Experience } from "../../models/cv-analysis.model";
import { DataService } from "../../services/data.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-cv-analysis",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./cv-analysis.component.html",
  styleUrls: ["./cv-analysis.component.css"],
})
export class CvAnalysisComponent {
  @ViewChild("modalContent", { static: false }) modalContent!: ElementRef;

  selectedExperience: Experience | null = null;
  showSkillsDropdown = false;
  hardSkills: Skill[] = [];
  softSkills: Skill[] = [];

  constructor(
    public dialogRef: MatDialogRef<CvAnalysisComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { analysis: CvAnalysis },
    private router: Router,
    private dataService: DataService,
  ) {
    console.log("CV Analysis data received:", this.data);
    this.categorizeSkills();
    // Sélectionner la première expérience par défaut
    if (this.getExperiences().length > 0) {
      this.selectedExperience = this.getExperiences()[0];
    }
  }

  private categorizeSkills(): void {
    const allSkills = this.getAllSkills();

    // Définir les catégories de hard skills (liste étendue et corrigée)
    const hardSkillsKeywords = [
      // Langages de programmation
      'javascript', 'js', 'python', 'py', 'java', 'html', 'css', 'react', 'angular', 'vue',
      'node.js', 'nodejs', 'sql', 'mongodb', 'git', 'docker', 'aws', 'php', 'c#', 'csharp',
      'c++', 'cpp', 'typescript', 'ts', 'ruby', 'swift', 'kotlin', 'go', 'golang', 'rust',
      'scala', 'perl', 'lua', 'r', 'matlab', 'bash', 'shell', 'powershell',

      // Frameworks et bibliothèques
      'spring', 'django', 'flask', 'express', 'laravel', 'symfony', 'asp.net', 'net',
      'jquery', 'bootstrap', 'tailwind', 'sass', 'less', 'webpack', 'babel', 'gulp', 'grunt',
      'redux', 'vuex', 'rxjs', 'rxjs', 'nestjs', 'fastapi', 'graphql', 'apollo',

      // Bases de données
      'mysql', 'postgresql', 'oracle', 'sqlite', 'cassandra', 'neo4j', 'redis', 'memcached',
      'elasticsearch', 'solr', 'couchdb', 'firebase', 'dynamodb', 'cosmosdb',

      // DevOps et Cloud
      'jenkins', 'kubernetes', 'k8s', 'terraform', 'ansible', 'puppet', 'chef', 'docker',
      'gitlab ci', 'github actions', 'circleci', 'travis', 'azure', 'gcp', 'google cloud',
      'heroku', 'digitalocean', 'linode', 'vercel', 'netlify', 'cloudflare',

      // Outils de développement
      'vscode', 'intellij', 'eclipse', 'sublime', 'vim', 'emacs', 'atom', 'webstorm',
      'pycharm', 'visual studio', 'xcode', 'android studio',

      // Systèmes d'exploitation
      'linux', 'ubuntu', 'centos', 'redhat', 'debian', 'windows', 'macos', 'unix',

      // Technologies web
      'rest', 'api', 'json', 'xml', 'ajax', 'websocket', 'oauth', 'jwt', 'ssl', 'tls',
      'http', 'https', 'tcp/ip', 'dns', 'cdn',

      // Testing et QA
      'jest', 'mocha', 'jasmine', 'cypress', 'selenium', 'karma', 'protractor', 'testng',
      'junit', 'phpunit', 'rspec', 'pytest', 'unittest', 'chai', 'enzyme',

      // Mobile
      'android', 'ios', 'flutter', 'react native', 'xamarin', 'ionic', 'cordova', 'capacitor',

      // Data Science et ML
      'machine learning', 'ml', 'ai', 'artificial intelligence', 'data science', 'big data',
      'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'jupyter',
      'tableau', 'power bi', 'qlik', 'looker', 'matplotlib', 'seaborn', 'plotly',

      // Design et UX
      'photoshop', 'illustrator', 'figma', 'sketch', 'xd', 'invision', 'zeplin', 'principle',
      'blender', 'maya', '3ds max', 'autocad', 'sketch up',

      // Game Development
      'unity', 'unreal engine', 'godot', 'cocos2d', 'gamemaker', 'cryengine',

      // CMS et E-commerce
      'wordpress', 'shopify', 'magento', 'woocommerce', 'drupal', 'joomla', 'prestashop',
      'opencart', 'squarespace', 'wix',

      // Sécurité
      'cybersecurity', 'penetration testing', 'ethical hacking', 'owasp', 'nmap', 'metasploit',
      'burp suite', 'wireshark', 'firewall', 'encryption',

      // Autres technologies
      'blockchain', 'ethereum', 'solidity', 'smart contracts', 'iot', 'arduino', 'raspberry pi',
      'embedded systems', 'vhdl', 'verilog', 'fpga'
    ];

    this.hardSkills = allSkills.filter(skill => {
      // Fix: Guard for undefined name
      if (!skill.name) return false;
      return hardSkillsKeywords.some(keyword =>
        skill.name.toLowerCase().includes(keyword.toLowerCase())
      );
    });

    this.softSkills = allSkills.filter(skill => {
      // Fix: Guard for undefined name
      if (!skill.name) return true; // Default to soft if no name
      return !hardSkillsKeywords.some(keyword =>
        skill.name.toLowerCase().includes(keyword.toLowerCase())
      );
    });
  }

  toggleSkillsDropdown(): void {
    this.showSkillsDropdown = !this.showSkillsDropdown;
  }

  getScore(): number {
    return this.data?.analysis?.score || this.calculateScore(this.getAllSkills());
  }

  private calculateScore(skills: Skill[]): number {
    if (!skills || skills.length === 0) return 0;

    const levelScores: { [key: string]: number } = {
      'expert': 100,
      'advanced': 75,
      'intermediate': 50,
      'beginner': 25
    };

    const totalScore = skills.reduce((sum, skill) => {
      const level = skill?.level;  // Guard : skill.level safe
      if (!level) return sum;  // Skip si undefined
      const lower = level.toLowerCase();  // Safe
      return sum + (levelScores[lower] || 0);
    }, 0);

    return Math.round(totalScore / skills.length);
  }

  getLevelColor(level: string | undefined): string {
    // Fix: Guard for undefined level
    if (!level) return "skill-default";
    switch (level.toLowerCase()) {
      case "expert":
        return "skill-expert";
      case "advanced":
        return "skill-advanced";
      case "intermediate":
        return "skill-intermediate";
      case "beginner":
        return "skill-beginner";
      default:
        return "skill-default";
    }
  }

  getLevelLabel(level: string | undefined): string {
    // Fix: Guard for undefined level
    if (!level) return "Inconnu";
    switch (level.toLowerCase()) {
      case "expert":
        return "Expert";
      case "advanced":
        return "Avancé";
      case "intermediate":
        return "Intermédiaire";
      case "beginner":
        return "Débutant";
      default:
        return level;
    }
  }

  getAllSkills(): Skill[] {
    return this.data?.analysis?.skills || [];
  }

  getExperiences(): Experience[] {
    // Fix: Remove duplication
    return this.data?.analysis?.experience || [];
  }

  selectExperience(experience: Experience): void {
    this.selectedExperience = experience;
  }

  isExperienceSelected(experience: Experience): boolean {
    return this.selectedExperience === experience;
  }

  hasValidData(): boolean {
    return !!(this.data?.analysis?.skills?.length > 0 || this.data?.analysis?.experience?.length > 0);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  async onDownload(): Promise<void> {
    if (!this.data?.analysis) {
      alert("Aucune donnée à télécharger.");
      return;
    }

    try {
      // Créer un élément temporaire pour le PDF avec des styles optimisés pour A4
      const tempElement = document.createElement('div');
      tempElement.style.width = '210mm';
      tempElement.style.minHeight = '297mm';
      tempElement.style.padding = '20mm';
      tempElement.style.background = 'white';
      tempElement.style.fontFamily = 'Arial, sans-serif';
      tempElement.style.color = '#333';
      tempElement.style.margin = '0 auto';
      tempElement.style.boxSizing = 'border-box';

      // Cloner le contenu original
      const originalContent = this.modalContent.nativeElement.cloneNode(true) as HTMLElement;

      // Appliquer les styles pour l'impression
      this.applyPrintStyles(originalContent);

      // Ajouter l'en-tête du PDF
      const header = this.createPdfHeader();
      tempElement.appendChild(header);

      tempElement.appendChild(originalContent);
      document.body.appendChild(tempElement);

      const canvas = await html2canvas(tempElement, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: tempElement.offsetWidth,
        height: tempElement.scrollHeight,
        windowWidth: tempElement.scrollWidth,
        windowHeight: tempElement.scrollHeight,
      });

      // Nettoyer l'élément temporaire
      document.body.removeChild(tempElement);

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      // Dimensions A4 en mm
      const pageWidth = 180;
      const pageHeight = 200;

      // Calculer les dimensions de l'image
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      // Centrer l'image sur la page
      const xPosition = 0;
      let yPosition = 0;

      if (imgHeight > pageHeight) {
        yPosition = -(imgHeight - pageHeight) / 2;
      }

      pdf.addImage(imgData, "PNG", xPosition, yPosition, imgWidth, imgHeight);
      pdf.save(`test-nova-analyse-cv-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Erreur lors du téléchargement du PDF. Vérifiez la console.");
    }
  }

  private applyPrintStyles(element: HTMLElement): void {
    // Supprimer les éléments inutiles pour l'impression
    const elementsToRemove = element.querySelectorAll('.dialog-header, .dialog-footer, .close-button, .skills-toggle-btn, button, .no-print');
    elementsToRemove.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    // Appliquer des styles d'impression à tous les éléments
    const allElements = element.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i] as HTMLElement;
      el.style.boxShadow = 'none';
      el.style.transition = 'none';
      el.style.animation = 'none';
      el.style.transform = 'none';
      el.style.boxSizing = 'border-box';
    }

    // Container principal pour centrer le contenu
    const mainContainer = element.querySelector('.modal-content, .dialog-content') as HTMLElement;
    if (mainContainer) {
      mainContainer.style.width = '100%';
      mainContainer.style.maxWidth = '200mm';
      mainContainer.style.margin = '0 auto';
      mainContainer.style.padding = '0';
    }

    // Styles spécifiques pour les sections
    const sections = element.querySelectorAll('.score-section, .skills-section, .experience-section, .summary-section');
    sections.forEach((section: Element) => {
      const sectionEl = section as HTMLElement;
      sectionEl.style.margin = '10mm 0';
      sectionEl.style.padding = '6mm';
      sectionEl.style.border = '1px solid #ddd';
      sectionEl.style.borderRadius = '3mm';
      sectionEl.style.background = 'white';
      sectionEl.style.width = '100%';
    });

    // Ajuster la taille des polices pour l'impression
    const textElements = element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, li');
    textElements.forEach((el: Element) => {
      const textEl = el as HTMLElement;
      const currentSize = window.getComputedStyle(textEl).fontSize;
      const sizeInPx = parseInt(currentSize);

      const tagName = textEl.tagName.toLowerCase();
      if (tagName === 'h1') {
        textEl.style.fontSize = '22px';
      } else if (tagName === 'h2') {
        textEl.style.fontSize = '18px';
      } else if (tagName === 'h3') {
        textEl.style.fontSize = '16px';
      } else if (sizeInPx > 14) {
        textEl.style.fontSize = '14px';
      } else {
        textEl.style.fontSize = '12px';
      }

      textEl.style.lineHeight = '1.4';
    });

    // Optimiser les badges pour l'impression
    const badges = element.querySelectorAll('.badge, .tag, .skill-item');
    badges.forEach((badge: Element) => {
      const badgeEl = badge as HTMLElement;
      badgeEl.style.padding = '3px 8px';
      badgeEl.style.margin = '2px';
      badgeEl.style.fontSize = '11px';
      badgeEl.style.display = 'inline-block';
    });

    // Optimiser la timeline
    const timelineItems = element.querySelectorAll('.timeline-item, .experience-item');
    timelineItems.forEach((item: Element) => {
      const itemEl = item as HTMLElement;
      itemEl.style.padding = '4mm';
      itemEl.style.margin = '3mm 0';
      itemEl.style.borderLeft = '3px solid #667eea';
    });

    // Assurer que le contenu utilise tout l'espace disponible
    element.style.display = 'block';
    element.style.width = '100%';
    element.style.height = 'auto';
  }

  private createPdfHeader(): HTMLElement {
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '10mm';
    header.style.paddingBottom = '5mm';
    header.style.borderBottom = '2px solid #667eea';

    header.innerHTML = `
    <h1 style="color: #667eea; margin: 0; font-size: 24px; font-weight: bold;">Test Nova</h1>
    <h2 style="color: #333; margin: 5px 0 0 0; font-size: 18px; font-weight: normal;">Analyse de CV</h2>
    <p style="color: #666; margin: 2px 0 0 0; font-size: 12px;">Date: ${new Date().toLocaleDateString('fr-FR')}</p>
  `;

    return header;
  }

  onNextTest(): void {
    if (!this.data?.analysis) {
      alert("Aucune analyse disponible pour le test.");
      return;
    }

    this.dataService.setCvAnalysis(this.data.analysis);
    this.dialogRef.close();
    this.router.navigate(["/test"]);
  }
}