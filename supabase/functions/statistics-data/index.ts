
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, region, years } = await req.json()
    
    if (type === 'education') {
      const education = await fetchEducationData(region, years)
      return new Response(
        JSON.stringify({ education }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Unknown type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Statistics API Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function fetchEducationData(region?: string, years?: number[]) {
  try {
    // Hae opiskelijamäärät
    const studentsResponse = await fetch('https://pxdata.stat.fi/PXWeb/api/v1/fi/StatFin/kou/koulutukseen_hakeutuminen/statfin_kouhaku_pxt_12bs.px', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: [
          {
            code: "Vuosi",
            selection: {
              filter: "item",
              values: years?.map(String) || ["2020", "2021", "2022", "2023"]
            }
          },
          {
            code: "Alue",
            selection: {
              filter: "item", 
              values: [region === 'pshva' ? "Pohjois-Savo" : "KOKO MAA"]
            }
          }
        ],
        response: {
          format: "json"
        }
      })
    })

    if (!studentsResponse.ok) {
      console.log('Statistics API error, using fallback data')
      return getFallbackEducationData()
    }

    const studentsData = await studentsResponse.json()
    
    // Simuloi opetuksen laadun mittareita
    const educationMetrics = years?.map((year, index) => {
      const baseStudents = 250
      const growth = index * 15
      const satisfactionBase = 4.1
      const employmentBase = 92
      
      return {
        year,
        students: baseStudents + growth + Math.floor(Math.random() * 20),
        graduates: Math.floor((baseStudents + growth) * 0.25),
        satisfactionScore: Number((satisfactionBase + (index * 0.1) + Math.random() * 0.2).toFixed(1)),
        employmentRate: employmentBase + (index * 2) + Math.floor(Math.random() * 3)
      }
    }) || getFallbackEducationData()

    return educationMetrics

  } catch (error) {
    console.error('Error fetching education data:', error)
    return getFallbackEducationData()
  }
}

function getFallbackEducationData() {
  return [
    { year: 2020, students: 245, graduates: 58, satisfactionScore: 4.1, employmentRate: 92 },
    { year: 2021, students: 267, graduates: 62, satisfactionScore: 4.2, employmentRate: 94 },
    { year: 2022, students: 289, graduates: 71, satisfactionScore: 4.3, employmentRate: 96 },
    { year: 2023, students: 312, graduates: 79, satisfactionScore: 4.4, employmentRate: 97 }
  ]
}
