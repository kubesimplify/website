
import chadMCrowell from '../components/liveworkshop/assests/Speaker_Imgs/ChadMCrowell.jpeg'
import dan_garfield from '../components/liveworkshop/assests/Speaker_Imgs/dan-garfield.jpeg'
import david from '../components/liveworkshop/assests/Speaker_Imgs/DavidFlanagan.png'
import saiyam from '../components/liveworkshop/assests/Speaker_Imgs/Saiyam-Pathak.jpg'
import kamesh from '../components/liveworkshop/assests/Speaker_Imgs/kamesh-sampath.png'
import karthik from '../components/liveworkshop/assests/Speaker_Imgs/karthik.png'
import lee from '../components/liveworkshop/assests/Speaker_Imgs/lee-calcote.webp'
import micheal from '../components/liveworkshop/assests/Speaker_Imgs/micheal-friedrich.jpeg'
import rewanth from '../components/liveworkshop/assests/Speaker_Imgs/Rewanth-Tammana.jpeg'

export const workshopData = [
    {
      coverPhoto: chadMCrowell,
      workshopName: "Linux & Docker Fundamentals",
      date: "July 11th, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "This workshop aims to build a solid Linux and Docker foundation. You will learn about Linux fundamentals, containers and Docker.",
      workshopLink:
        "https://youtu.be/EUu1E_YKGTw",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: saiyam,
      workshopName: "Kubernetes 101",
      date: "July 18th, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "This workshop helps you learn Kubernetes from scratch. Some of the topics include K8s fundamentals, Pods, Deployments, Services, Ingress & more.",
      workshopLink:
        "https://youtu.be/PN3VqbZqmD8",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: dan_garfield,
      workshopName: "GitOps With ArgoCD",
      date: "July 25th, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In this workshop you will learn the theory of GitOps and also apply all of those practices in your own application using the Argo project family.",
      workshopLink:
        "https://youtu.be/5rwIIusbUWM",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: rewanth,
      workshopName: "Kubernetes Security 101",
      date: "Aug 1st, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In the previous workshops, you learned about the basics of Docker & Kubernetes. This workshop aims to kick a notch higher by introducing you to the security aspects of the container world.",
      workshopLink:
        "https://youtu.be/ka0C09CAfho",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: karthik,
      workshopName: "Chaos Engineering with LitmusChaos",
      date: "Aug 24th, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In this workshop, we'll be learning to setup a chaos engineering tool - LitmusChaos (CNCF Incubating project)",
      workshopLink:
        "https://youtu.be/259I52_Zh3E",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: lee,
      workshopName: "Service Mesh",
      date: "Aug 31st, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In this workshop, Lee Calcote will be going over through the fundamentals of Service Mesh starting from the scratch and covering various essentials topics through Hands-On Labs.",
      workshopLink:
        "https://youtu.be/9KC4Jgtz_j4",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: david,
      workshopName: "Kubernetes Troubleshooting",
      date: "Sept 12th, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In this workshop, we will learn how to operate and manage a Kubernetes cluster by debugging some clusters broken by members of the Kubernetes Community.",
      workshopLink:
        "https://youtu.be/cRAA1B4R-1U",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: micheal,
      workshopName: "Kubernetes Observability",
      date: "Sept 19th, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In this workshop by Michael, you will learn the basics of Monitoring and Observability with microservices and container clusters.",
      workshopLink:
        "https://youtu.be/sMEEVbZ4NFM",
        workshopStatus: "Watch Now",
    },
    {
      coverPhoto: kamesh,
      workshopName: "CI + GitOps with Cloud Native Java",
      date: "Oct 21st, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In this workshop, Kamesh Sampath will lead us through the journey of deploying our simple java application, with the help of a toolchain made with DroneCI, ArgoCD.",
      workshopLink:
        "https://forms.gle/mexwhLULBaQKywxJ6",
        workshopStatus: "Register Now",
    },
  ];



// If we have no coverPhoto link we cam just simply remove the coverphoto line in the teamData  and it will show the default image 

export const teamData = [
    {
        name: 'Aayush Sharma',
        coverPhoto: 'https://avatars.githubusercontent.com/u/78820926?v=4',
        twitterLink: 'https://twitter.com/SuperAayush14',
        linkedinLink: 'https://www.linkedin.com/in/superaayush/',
        githubLink: 'https://github.com/SuperAayush'
    },
    {
        name: 'Avinesh Tripathi',
        coverPhoto: 'https://avatars.githubusercontent.com/u/73980067?v=4',
        twitterLink: 'https://twitter.com/Avinesh__T',
        linkedinLink: 'https://www.linkedin.com/in/avineshtripathi/',
        githubLink: 'https://github.com/AvineshTripathi'
    },
    {
        name: 'Vaidansh Bhardwaj',
        coverPhoto: 'https://avatars.githubusercontent.com/u/94763871?v=4',
        twitterLink: 'https://twitter.com/vaidansh23',
        linkedinLink: 'https://www.linkedin.com/in/vaidanshbhardwaj',
        githubLink: 'https://github.com/vaidanshbhardwaj'
    },
    {
        name: 'Aditya Tripathi',
        coverPhoto: 'https://avatars.githubusercontent.com/u/81632787?v=4',
        twitterLink: 'https://twitter.com/AdityaT94776666',
        linkedinLink: 'https://www.linkedin.com/in/aditya-tripathi-7108911ab/',
        githubLink: 'https://github.com/aditya5573'
    },
    {
        name: 'Lavakush Biyani',
        coverPhoto: 'https://avatars.githubusercontent.com/u/70131581?v=4',
        twitterLink: 'https://twitter.com/lavkushbiyani1',
        linkedinLink: 'https://www.linkedin.com/in/lavkush-biyani-07/',
        githubLink: 'https://github.com/lavakush07'
    },
    {
        name: 'Pawan Gudiwala',
        coverPhoto: 'https://avatars.githubusercontent.com/u/25551553?v=4',
        twitterLink: 'https://twitter.com/pavangudiwada_',
        linkedinLink: 'https://www.linkedin.com/in/pavangudiwada/',
        githubLink: 'https://github.com/pavangudiwada'
    },
    {
        name: 'Kunal Verma',
        coverPhoto: 'https://avatars.githubusercontent.com/u/72245772?v=4',
        twitterLink: 'https://twitter.com/kverma_twt',
        linkedinLink: 'https://www.linkedin.com/in/verma-kunal/',
        githubLink: 'https://github.com/verma-kunal'
    },
    {
        name: 'Dipankar Das',
        coverPhoto: 'https://avatars.githubusercontent.com/u/65275144?v=4',
        twitterLink: 'https://twitter.com/DipankarDas011',
        linkedinLink: 'https://www.linkedin.com/in/dipankar-das-1324b6206/',
        githubLink: 'https://github.com/dipankardas011'
    },
    {
        name: 'Bhavya Sachdeva',
        coverPhoto: 'https://avatars.githubusercontent.com/u/84725791?v=4',
        twitterLink: 'https://twitter.com/bhavya_58',
        linkedinLink: 'https://www.linkedin.com/in/bhavya-sachdeva9/',
        githubLink: 'https://github.com/bhavyastar'
    },
    {
        name: 'Anurag Kumar',
        coverPhoto: 'https://avatars.githubusercontent.com/u/81210977?v=4',
        twitterLink: 'https://twitter.com/kranurag7',
        linkedinLink: 'https://linkedin.com/in/kranurag7',
        githubLink: 'https://github.com/kranurag7'
    },
    {
        name: 'Barkatul Mujauddin',
        coverPhoto: 'https://avatars.githubusercontent.com/u/93897535?v=4',
        twitterLink: 'https://twitter.com/barkatul_20',
        linkedinLink: 'https://www.linkedin.com/in/barkatul-mujauddin-3a67771b8',
        githubLink: 'https://github.com/barkatul'
    },
    {
        name: 'Rishit Dagli',
        coverPhoto: 'https://avatars.githubusercontent.com/u/39672672?v=4',
        twitterLink: 'https://twitter.com/rishit_dagli',
        linkedinLink: 'https://www.linkedin.com/in/rishit-dagli/',
        githubLink: 'https://github.com/Rishit-dagli'
    },
    {
        name: 'Mayank Gupta',
        coverPhoto: 'https://avatars.githubusercontent.com/u/66107976?v=4',
        twitterLink: 'https://twitter.com/imayankgupta001',
        linkedinLink: 'https://www.linkedin.com/in/mkgupta001/',
        githubLink: 'https://github.com/mayankkuamr001'
    },
    {
        name: 'Arnav Barman',
        coverPhoto: 'https://avatars.githubusercontent.com/u/86536812?v=4',
        twitterLink: 'https://twitter.com/barman_arnav',
        linkedinLink: 'https://www.linkedin.com/in/arnavbarman/',
        githubLink: 'https://github.com/Arnav-Barman'
    },
    {
        name: 'Shivay Lamba',
        coverPhoto: 'https://avatars.githubusercontent.com/u/19529592?v=4',
        twitterLink: 'https://twitter.com/HowDevelop',
        linkedinLink: 'https://www.linkedin.com/in/shivaylamba/',
        githubLink: 'https://github.com/shivaylamba'
    },
    {
        name: 'Sanyam Jain',
        coverPhoto: 'https://avatars.githubusercontent.com/u/107163858?v=4',
        twitterLink: 'https://twitter.com/itsSanyam',
        linkedinLink: 'https://www.linkedin.com/in/sanyamjain04/',
        githubLink: 'https://github.com/sanyamjain04'
    },
    {
        name: 'Srinivas karnati',
        coverPhoto: 'https://avatars.githubusercontent.com/u/52213014?v=4',
        twitterLink: 'https://twitter.com/__karnati',
        linkedinLink: 'https://www.linkedin.com/in/srinivas-karnati/',
        githubLink: 'https://github.com/karnatisrinivas'
    },
    {
        name: 'Steve Wade',
        coverPhoto: 'https://avatars.githubusercontent.com/u/594451?v=4',
        twitterLink: 'https://twitter.com/swade1987',
        linkedinLink: 'https://www.linkedin.com/in/stevendavidwade/',
        githubLink: 'https://github.com/swade1987'
    },
    {
        name: 'Atharva Shinde',
        coverPhoto: 'https://avatars.githubusercontent.com/u/69111235?v=4',
        twitterLink: 'https://twitter.com/atharvashinde_',
        linkedinLink: 'https://www.linkedin.com/in/atharva-shinde-6468b4205/',
        githubLink: 'https://github.com/Atharva-Shinde'
    },
    {
        name: 'Bishal Dojo',
        coverPhoto: 'https://avatars.githubusercontent.com/u/70086051?v=4',
        twitterLink: 'https://twitter.com/bishaltwt7679',
        linkedinLink: 'https://www.linkedin.com/in/bishal-das-1bba8b1b8/',
        githubLink: 'https://github.com/bishal7679'
    },
    {
        name: 'Parul Sahoo',
        coverPhoto: 'https://avatars.githubusercontent.com/u/60248260?v=4',
        twitterLink: 'https://twitter.com/ParulSahoo',
        linkedinLink: 'https://www.linkedin.com/in/parul-sahoo-4bb8301a0/',
        githubLink: 'https://github.com/parul5sahoo'
    },
    {
        name: 'Tania Duggal',
        coverPhoto: 'https://avatars.githubusercontent.com/u/103496926?v=4',
        twitterLink: 'https://twitter.com/taniadtwt',
        linkedinLink: 'https://www.linkedin.com/in/tania-duggal-07a297220/',
        githubLink: 'https://github.com/taniaduggal'
    },
]

